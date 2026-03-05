## NodeJS
npm install openai

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-XXX",
});

const response = openai.responses.create({
  model: "gpt-5-nano",
  input: "write a haiku about ai",
  store: true,
});

response.then((result) => console.log(result.output_text));

## Python
pip install openai

from openai import OpenAI

client = OpenAI(
  api_key="sk-XXX"
)

response = client.responses.create(
  model="gpt-5-nano",
  input="write a haiku about ai",
  store=True,
)

print(response.output_text);
