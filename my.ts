import pg from "pg";

const x = async () => {
  const { Client } = pg;
  const client = new Client();
  await client.connect();

  const res = await client.query({ text: "SELECT 1, 2", rowMode: "array" });
  console.log(res.rows[0]); // Hello world!
  await client.end();
};

x();
