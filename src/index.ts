import Express from "express";
import DataLoader from "dataloader";

import bodyParser from "body-parser";
import uuidv4 from "uuid/v4";

import { DynamoDB } from "aws-sdk";

const app = Express();
const docClient = new DynamoDB({ endpoint: "http://localhost:8000", region: "test" });

app.use(bodyParser.json());

interface Item {
  postId: string;
  body: string;
  userId: string;
  refer: string | Item;
}

const loaderFunction = async (params: DynamoDB.GetItemInput[]) => {
  const param: DynamoDB.BatchGetItemInput = {
    RequestItems: {
      TopicOn: {
        Keys: [],
      },
    },
  };
  params.forEach(key => {
    param.RequestItems.TopicOn.Keys.push(key.Key);
  });
  const result = await docClient.batchGetItem(param).promise();
  return result.Responses!.TopicOn;
};

const loader = new DataLoader(loaderFunction);

app.get("/", async function(_, res) {
  const { unmarshall } = DynamoDB.Converter;
  const params: DynamoDB.Types.ScanInput = {
    TableName: "TopicOn",
  };
  const data = await docClient.scan(params).promise();
  const unmarshalled = data.Items!.map(value => unmarshall(value)) as Item[];
  const result = unmarshalled.map(async item => {
    if (item.refer !== "none") {
      const params: DynamoDB.GetItemInput = {
        TableName: "TopicOn",
        Key: {
          postId: {
            S: item.postId,
          },
        },
      };
      const referItem = unmarshall(await loader.load(params)); // await docClient.getItem(params).promise();
      item.refer = referItem as Item;
    }
    return item;
  });
  res.json(await Promise.all(result));
});

interface NewPostInput {
  userId: string;
  refer: string;
  text: string;
}

app.post("/", async function({ body }, res) {
  const { userId, refer, text }: NewPostInput = body;
  const postId = uuidv4();
  const params: DynamoDB.Types.PutItemInput = {
    TableName: "TopicOn",
    Item: {
      postId: {
        S: postId,
      },
      userId: {
        S: userId,
      },
      refer: {
        S: refer,
      },
      body: {
        S: text,
      },
    },
  };
  try {
    await docClient.putItem(params).promise();
    res.json({ postId });
  } catch (e) {
    console.log(e);
    res.status(400).json({ e });
  }
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
