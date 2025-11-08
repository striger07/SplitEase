import groupModel from "../models/groupModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

export const createGroup = async (req, res) => {
	// also add that person who created the group as a member of the group
	// and also add the group id to the user model
	const { name } = req.body;
	const newGroup = await groupModel.create({
		groupName: name,
		createdBy: req.user.id,
	});
	res.status(201).json(newGroup);
};

export const getGroups = async (req, res) => {
	try {
		const userId = req.user.id;

		const userGroups = await groupModel.find({
			$or: [{ createdBy: userId }, { members: userId }],
		});

		res.json(userGroups);
	} catch (err) {
		console.error("Error fetching groups:", err);
		res.status(500).json({ error: "Failed to fetch groups" });
	}
};

export const addMemberToGroup = async (req, res) => {
	const groupId = req.params.id;
	const { username } = req.body;
	try {
		const user = await userModel.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });
		const group = await groupModel.findById(groupId);
		if (!group) return res.status(404).json({ error: "Group not found" });
		if (group.members.includes(user._id)) {
			return res.status(400).json({ error: "User already in group" });
		}
		group.members.push(user._id);
		await group.save();
		res.status(200).json({
			message: "User added to group",
			member: user.username,
		});
	} catch (error) {
		console.error("Error adding member:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getGroupMembers = async (req, res) => {
	const groupId = req.params.id;
	if (!mongoose.Types.ObjectId.isValid(groupId)) {
		return res.status(400).json({ error: "Invalid group ID format" });
	}
	try {
		const group = await groupModel
			.findById(groupId)
			.populate("members", "username");
		if (!group) return res.status(404).json({ error: "Group not found" });
		res.status(200).json(group.members || []);
	} catch (error) {
		console.error("Error fetching group members:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
