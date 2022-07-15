const { ApolloServer, gql } = require("apollo-server");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
dotenv.config();
const { DB_URI, DB_NAME } = process.env;

const books = [
  {
    title: "The Awakening!",
    author: "Kate Chopin!",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`

  type Query {
    books: [Book]
  }

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }
`;

const resolvers = {
  Query: {
    books: (root, data, context) => {
        console.log(context)
        return books
    },
  },
};

const start = async () => {
  const client = new MongoClient(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
 
  });
  await client.connect();
  const db = client.db(DB_NAME);

  const context = {
    db,
  }

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    //apollo server will include this context variable to be able to access the mongo collections
    context
  });

  // The `listen` method launches a web server.
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
};
start();
