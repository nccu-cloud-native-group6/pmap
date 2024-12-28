/**
 * A lambda for sending a message to Discord
 */

interface DiscordEmbed {
  title?: string;
  description?: string;
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  color?: number;
  footer?: {
    text: string;
  };
}

export const handler = async (event: any): Promise<any> => {
  console.log('Recv event: ', JSON.stringify(event, null, 2));

  let content = undefined;
  let embeds = undefined;

  // The first event format will have responsePayload.message
  if (event.responsePayload.message) {
    const resp = event.responsePayload;
    const message = resp.message;
    const statusCode = Number(resp.statusCode);
    content = `${statusToEmoji(statusCode)} ${message}`;
  } else {
    // The other event is from lambda-destination on-failure
    embeds = await parsedOnFailureMessage(event);
  }
  await sendMsg(process.env.DISCORD_WEBHOOK_URL!, content, embeds);
};

function formatCodebox(content: string, maxLength = 1024) {
  // Discord 限制每個 field 最多 1024 字元
  const truncatedContent = content.slice(0, maxLength);
  return `\`\`\`${truncatedContent}\`\`\``; // Wrap in codeblock
}

async function parsedOnFailureMessage(event: any) {
  const functionArn = event.requestContext.functionArn;
  const functionName = functionArn.split(':').at(-2);
  const errorMessage = event.responsePayload.errorMessage;
  const errorTrace = event.responsePayload.trace.join('\n');
  const requestId = event.requestContext.requestId;

  return [
    {
      title: `🚨 Lambda Error: ${functionName}`,
      description: `**Message:** ${errorMessage}`,
      color: 0xff0000, // 紅色
      fields: [
        {
          name: 'Function',
          value: formatCodebox(functionName),
        },
        {
          name: 'Request ID',
          value: formatCodebox(requestId),
          inline: true,
        },
        {
          name: 'Trace',
          value: formatCodebox(errorTrace),
          inline: false,
        },
      ],
    },
  ];
}

async function sendMsg(
  webhookUrl: string,
  content?: string,
  embeds?: DiscordEmbed[],
) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      content: content,
      embeds: embeds,
      username: 'Pmap 小精靈',
      avatar_url: 'https://i.imgur.com/i1KO4EQ.png',
    }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  });
  return response;
}

function statusToEmoji(statusCode: number) {
  switch (statusCode) {
    case 200:
      return ':white_check_mark:';
    case 500:
      return ':x:';
    default:
      return ':sound:';
  }
}
