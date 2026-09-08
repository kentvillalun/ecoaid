const sendOtp = async (phoneNumber) => {
   if (!process.env.SEMAPHORE_API_KEY || process.env.SEMAPHORE_API_KEY.trim() === "") {
    const devCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("========================================");
    console.log("OTP (dev mode — no SMS sent)");
    console.log(`Phone  : ${phoneNumber}`);
    console.log(`Code   : ${devCode}`);
    console.log("========================================");
    return devCode;
  }

  const response = await fetch("https://api.semaphore.co/api/v4/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.SEMAPHORE_API_KEY,
      number: phoneNumber,
      message:
        "Your EcoProfit verification code is: {otp}. Valid for 10 minutes. Do not share this with anyone.",
      sendername: process.env.SEMAPHORE_SENDER_NAME,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message ?? "Failed to send OTP");
  }

  const result = await response.json();
  const code = result[0]?.code?.toString();



  if (!code) {
    throw new Error("We couldn't send your verification code. Please try again in a moment.");
  }

  return code;
};

export { sendOtp };
