// Export the GraphQL schema (type definitions) as a template string
export const typeDefs = ` 
     scalar Date

    type Table {
        _id:String!        
        status:String!     
        number:Int!        
    }

    type Food {
        type:String!     
        category:String!   
        foodName:String!   
        foodImage:String!   
    }

    type Weater {
        name:String!      
        userId:String!    
    }

    type Order {
        _id:String!        
        foodId:String!     
        food:Food!        
        quntity:String!   
        price:Int!           
        weaterId:String!   
        weater:Weater!    
        tableNo:Int!       
        status:String!    
        createdAt:Date!  
    }

    type Bill {
        _id: String!       
        billId:String!    
        tableId:String!    
        table:Table!       
        orderIds:[String!]! 
        orders:[Order!]!  
        totalAmount:Int!   
        status:String!    
        createdAt:Date!  
    }

    type Query {
        getTable: [Table!]! 
        getFood: [Food!]!   
        getWeater: [Weater!]! 
        getOrder: [Order!]! 
        getBill: [Bill!]!   
        getOrdersByWaiterId(weaterId: String!): [Order!]!
        getOrdersForCook: [Order!]!
    }
`;

// Import Mongoose models so we can talk to MongoDB
import Table from "@/lib/schema/Table";
import Order from "@/lib/schema/Order";
import Bill from "@/lib/schema/Bill";
import Food from "@/lib/schema/FoodList";
import Weater from "@/lib/schema/Weater";
import { connectDB } from "@/lib/db/dbConnection";
import { GraphQLScalarType, Kind } from "graphql";
import { Types } from "mongoose";

// Export resolvers: functions that actually fetch the data for each field
export const resolvers = {
  // Custom scalar resolver for the Date type
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Custom Date scalar type",

    // Convert Date object to ISO string when sending to client
    serialize(value) {
      return value instanceof Date ? value.toISOString() : null;
    },

    // Convert incoming value (string/number) to Date object
    parseValue(value) {
      return new Date(value as string | number | Date);
    },

    // Convert AST string literal to Date object
    parseLiteral(ast) {
      return ast.kind === Kind.STRING ? new Date(ast.value) : null;
    },
  }),

  // Resolvers for fields inside Order type
  Order: {
    // Fetch full food details using the foodId stored in parent
    food: async (parent: { foodId: string }) => {
      try {
        connectDB(); // Ensure DB connection
        return await Food.findById(parent.foodId); // Get food from MongoDB
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },
    // Fetch full waiter details using the weaterId stored in parent
    weater: async (parent: { weaterId: string }) => {
      try {
        connectDB();
        return await Weater.findById(parent.weaterId);
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },
  },

  // Resolvers for fields inside Bill type
  Bill: {
    // Fetch full table details using the tableId stored in parent
    table: async (parent: { tableId: string }) => {
      try {
        connectDB();
        return await Table.findById(parent.tableId);
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },
    // Fetch full order details for every orderId in the bill
    orders: async (parent: { orderIds: string[] }) => {
      try {
        connectDB();
        return await Order.find({ _id: { $in: parent.orderIds } });
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },
  },

  // Top-level query resolvers
  Query: {
    // Return every table document
    getTable: async () => {
      try {
        connectDB();
        return await Table.find();
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },

    // Return every food document
    getFood: async () => {
      try {
        connectDB();
        return await Food.find();
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },

    // Return every waiter document
    getWeater: async () => {
      try {
        connectDB();
        return await Weater.find();
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },

    // Return every order document
    getOrder: async () => {
      try {
        connectDB();
        return await Order.find();
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },

    // Return every bill document
    getBill: async () => {
      try {
        connectDB();
        return await Bill.find().sort({
          createdAt: -1,
        });
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },

    // Return every order document for a specific waiter
    getOrdersByWaiterId: async (
      _: undefined,
      { weaterId }: { weaterId: string }
    ) => {
      try {
        connectDB();
        return await Order.find({
          weaterId: new Types.ObjectId(weaterId),
        }).sort({
          createdAt: -1,
        });
      } catch (error) {
        throw new Error("Internal server error", error as ErrorOptions);
      }
    },

    //Return orders for cook
    getOrdersForCook: async () => {
      connectDB();
      return await Order.find();
    },
  },
};

/**
 =>Query for apollo server..

  query getdata {
  getBill {
    _id
    billId
    tableId
    table {
      _id
      status
      number
    }
    orderIds
    orders {
      _id
      foodId
      food {
        category
        type
        foodName
      }
      quntity
      price
      weaterId
      weater {
        name
        userId
      }
      tableNo
      status
    }
    totalAmount
    status
    createdAt
  }
}

 */
