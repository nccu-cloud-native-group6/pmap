/**
 * A lambda for sending a message to Discord
*/

export const handler = async (event: any): Promise<any> => {
  console.log("Recv event: ", JSON.stringify(event, null, 2));
 
  const resp = event.responsePayload;
  let message = resp.message;
  let statusCode = Number(resp.statusCode);
  
  await sendMsgToDiscord(process.env.DISCORD_WEBHOOK_URL!, message, statusCode);
}

async function sendMsgToDiscord(webhookUrl: string, message: string, statusCode: number) {
  console.log(`Sending message to Discord: ${message}`);
  const content = `${statusToEmoji(statusCode)} ${message}`; 
  const response = await fetch(webhookUrl, {
    method: "POST",
    body: JSON.stringify({
      content: content,
      username: "Pmap 小精靈",
      avatar_url: "https://i.imgur.com/i1KO4EQ.png",
    }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  });
  return response;
}

function statusToEmoji(statusCode: number) {
  switch (statusCode) {
    case 200:
      return ":white_check_mark:";
    case 500:
      return ":x:";
    default:
      return ":sound:";
  }
}