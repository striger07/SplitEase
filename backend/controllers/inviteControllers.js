import transporter from "../utils/mailer.js";

export const sendInvite = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ error: "Email is required" });
	}

	try {
		const mailOptions = {
			from: "harshalrelan99@gmail.com",
			to: email,
			subject: "You're invited to SplitEase!",
			text: `Hey there! 👋\n\nYou’ve been invited to join a group on SplitEase.\n\nhttps://splitease2-1.onrender.com/register\n\n- Team SplitEase`,
		};

		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: "Invite email sent successfully" });
	} catch (error) {
		console.error("Error sending email:", error);
		res.status(500).json({ error: "Failed to send email" });
	}
};
