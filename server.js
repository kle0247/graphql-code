const express = require('express');
const { graphqlHTTP } = require('express-graphql'); //allows us to make HTTP protocol request with client
const {
    GraphQLSchema, //used to create root query and mutation - what schema are we trying to hit
    GraphQLObjectType, //object types
    GraphQLString, //data validations to protect data
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');
const {
    actors,
    movies
} = require('./seedData');

//initialize express app
const app = express();

const MovieType = new GraphQLObjectType({
    name: 'Movie', 
    description: 'Represents a single movie with a actor',
    fields: (() => ({
        id: {type: GraphQLNonNull(GraphQLInt)}, //cant be null but also an integer type
        name: {type: GraphQLNonNull(GraphQLString)},
        actorId: {type: GraphQLNonNull(GraphQLInt)},
        actor: {
            type: ActorType,
            resolve: (movie) => {
                return actors.find(actor => actor.id === movie.actorId)
            }
        }
    }))
});

const ActorType = new GraphQLObjectType({
    name: 'Actor', 
    description: 'Represents a single actor of a movie',
    fields: (() => ({
        id: {type: GraphQLNonNull(GraphQLInt)}, //cant be null but also an integer type
        name: {type: GraphQLNonNull(GraphQLString)},
        movies: {
            type: new GraphQLList(MovieType),
            resolve: (actor) => {
                return movies.filter(movie => movie.actorId === actor.id)
            }
        }
    }))
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        movie: {
            type: MovieType,
            description: 'A single movie',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => movies.find(movie => movie.id === args.id)
        },
        movies: {
            type: new GraphQLList(MovieType),
            description: 'List of all movies',
            //how do you want to send it back
            resolve: () => movies //how it's formatted in db
        },
        actor: {
            type: ActorType,
            description: 'A single actor',
            args: {
                id: { type: GraphQLInt }
            }, 
            resolve: (parent, args) => actors.find(actor => actor.id === args.id)
        },
        actors: {
            type: new GraphQLList(ActorType),
            description: 'List of all actors',
            //how do you want to send it back
            resolve: () => actors //how it's formatted in db
        }
    })
})


const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: () => ({
        addMovie: {
            type: MovieType,
            description: 'Adding a movie',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                actorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                //bc we're not using a db, just push to array
                const movie = {
                    id: movies.length + 1,
                    name: args.name,
                    actorId: args.actorId
                }
                //this is where you talk asynchronously to db to make transcaction happen
                movies.push(movie)
                return movie
            }
        }
    })
})

//create listener
app.listen(5004, () => console.log('server is running on PORT: 5004!'))

const schema = new GraphQLSchema(
    {
        query: RootQueryType, //retrieve info
        mutation: RootMutationType //put, post, delete
    }
);

//instead of get 
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true //playground enabled
}));

