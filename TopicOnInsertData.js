const uuid = require("uuid/v4");

const { DynamoDB } = require("aws-sdk");

const docClient = new DynamoDB({ endpoint: "http://localhost:8000", region: "test" });

(async () => {
  const params = {
    RequestItems: {
      TopicOn: [
        {
          PutRequest: {
            Item: {
              postId: {
                S: uuid(),
              },
              userId: {
                S: "krlrhkstk",
              },
              refer: {
                S: "none",
              },
              body: {
                S: "Lorem ipsum dolor sit amet",
              },
            },
          },
        },
        {
          PutRequest: {
            Item: {
              postId: {
                S: uuid(),
              },
              userId: {
                S: "hellotur",
              },
              refer: {
                S: "none",
              },
              body: {
                S: "consectetur adipiscing elit",
              },
            },
          },
        },
        {
          PutRequest: {
            Item: {
              postId: {
                S: uuid(),
              },
              userId: {
                S: "francis",
              },
              refer: {
                S: "none",
              },
              body: {
                S: "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              },
            },
          },
        },
      ],
    },
  };
  console.log(await docClient.batchWriteItem(params).promise());
})();
