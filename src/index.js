const { ApolloServer, gql } = require("apollo-server");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs")
const { MongoClient } = require("mongodb");
dotenv.config();
const { DB_URI, DB_NAME } = process.env;

const typeDefs = gql`

#  Queries
type Query  {
  myTaskList: [TaskList!]!
}
# mutations
type Mutation { 
  signUp(input: SignUpInput!): AuthUser!
  signIn(input: SignInInput!): AuthUser!

}



# -----------------INPUTS-----------------------
#use input to manage the lengths of mutation parameter 
input SignUpInput {
  email: String!, password: String!, name: String!, avatar: String
}

input SignInInput{ 
  email: String!
  password: String!
}
# -----------------INPUTS-----------------------

type AuthUser{
  user: User!
  token: String!
}

#  user type 
type User { 
  id: ID!
  name: String!
  email: String!
  avatar: String
}

type TaskList { 
  id: ID!
  createdAt: String! 
  title: String!
  # a percentage % of how far we are on the task 
  progress: Float!
  # array of users
  user: [User!]!
  # array of todos. TaskLis is parent of User and ToDo
  todos: [ToDo!]!
}

  


  type ToDo { 
    id: ID!
    content: String!
    isCompleted: Boolean!
    taskList: TaskList!
  }

`;

const resolvers = {
  Query: {
    //function for the mytast
    myTaskList: () => []
  },
  Mutation: {
    signUp: async (_, {input }, { db}) => {
      //pass in what you want to encrompt
      const hashedPassword = bcrypt.hashSync(input.password);
      const newUser = { 
        ...input, 
        //password will get overided and applied to input array with hased bass
        password: hashedPassword
      }

      const result =  await db.collection('Users').insertOne(newUser)

      console.log(result.ops);
      const user = result.ops[0]
      
      return { 
        user, 
        token: 'token'
      }

    }, 
    signIn: () => {

    }
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
