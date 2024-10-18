import Connection from "../models/connectionModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const userId = req.params.id; //to whom the request will be sent

    if (senderId.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }

    if (req.user.connections.includes(senderId)) {
      return res.status(400).json({ message: "You are already connected" });
    }

    const existingRequest = await Connection.findOne({
      sender: senderId, 
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A connection request already exists" });
    }

    await Connection.create({
      sender: senderId,
      recipient: userId,
    });

    res.status(201).json({ message: "Connection request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user._id;
    const request = await Connection.findById(requestId)
    .populate("sender", "name email username")
    .populate("recipient", "name username");
    
    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (request.recipient._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    request.status = "accepted";

    await request.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: request.sender._id },
    });
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: userId },
    });

    await Notification.create({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: userId,
    });
    res.json({ message: "Connection accepted successfully" });
  } catch (error) {
    console.error("Error in acceptConnectionRequest controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user._id;

    const request = await Connection.findById(requestId);

    if (request.recipient._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    request.status = "rejected";

    await request.save();

    res.json({ message: "Connection request rejected" });
  } catch (error) {
    console.error("Error in rejectConnectionRequest controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConnectionsRequest = async (req, res) => {
  try {
    const userId = req.user._id;

    const request = await Connection.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");

    res.json(request);
  } catch (error) {
    console.error("Error in getConnectionRequests controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );

    res.json(connections);
  } catch (error) {
    console.error("Error in getUserConnections controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const targetedId = req.params.id;
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, {
      $pull: { connections: targetedId },
    });

    await User.findByIdAndUpdate(targetedId, {
      $pull: { connections: userId },
    });

    res.json({ message: "Connection removed successfully" });
  } catch (error) {
    console.error("Error in removeConnection controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const targetedId = req.params.id;
    const userId = req.user._id;

    const currentUser = req.user;

    if (currentUser.connections.includes(targetedId)) {
      return res.json({ status: "connected" });
    }

    const pendingRequest = await Connection.findOne({
      $or: [
        { sender: userId, recipient: targetedId },
        { sender: targetedId, recipient: userId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === userId.toString()) {
        return res.json({ status: "pending" });
      } else {
        return res.json({ status: "received", requestId: pendingRequest._id });
      }
    }

   return res.json({ status: "not_connected" });
  } catch (error) {
    console.error("Error in getConnectionStatus controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
