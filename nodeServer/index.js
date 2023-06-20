// Node server which will handle socket io connections
const path = require("path");

const http = require("http");

const socketio = require("socket.io");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname, "../public");

app.use(express.static(staticPath));

const users = [];

const addUser = ({ id, Name, room }) => {
  // username = username.trim().toUpperCase()
  // room = room.trim().toUpperCase()

  // if(!username || !room){
  //     return {
  //         error: "Username and room are required!"
  //     }
  // }

  // const existingUser = users.find((user)=>{
  //     return user.room === room && user.username === username
  // })

  // if(existingUser){
  //     return{
  //         error: "Username is in use!"
  //     }
  // }

  const user = { id, Name, room };
  users.push(user);
  return { user };
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUsersInRoom = (room) =>{
  return users.filter((user)=> user.room === room)
}



io.on("connection", (socket) => {
  // If any new user joins, let other users connected to the server know!

  socket.on("new-user-joined", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.broadcast.to(user.room).emit("user-joined", user.Name);
    io.to(user.room).emit("roomData",{
      room: user.room,
      users: getUsersInRoom(user.room)
  })
    callback();
  });


  socket.on("send", (message) => {
    const user = getUser(socket.id);

    // io.to(user.room).emit("message", generateMessage(user.username,message))
    // callback() //acknowledgement
    socket
      .to(user.room)
      .broadcast.emit("receive", { message: message, Name: user.Name });
  });

  // If someone sends a message, broadcast it to other people
  // socket.on('send', message =>{
  //     socket.broadcast.emit('receive', {message: message, Name: users[socket.id]})
  // });

  // If someone leaves the chat, let others know

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      socket.to(user.room).broadcast.emit("left", user.Name);
    //   io.to(user.room).emit(
    //     "message",
    //     generateMessage("Admin", `${user.username} has left!`)
    //   );
      io.to(user.room).emit("roomData",{
          room: user.room,
          users: getUsersInRoom(user.room)
      })
    }
  });

  // socket.on('disconnect', message =>{

  //     delete users[socket.id];
  // });
});

server.listen(port, () => console.log(`App is listening on port ${port}.`));
