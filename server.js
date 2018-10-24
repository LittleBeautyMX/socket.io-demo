var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var nickName = {}
var guestNum = 1

var nowInRoom = []

//首次登陆命名
function assignName(socket,nickName,guestNum){
  let firstName = '游客'+guestNum+'号'
  nickName[socket.id] = firstName
  //广播上线
  socket.broadcast.emit('chat message',firstName+'上线了')
  //给自己看 当前名字
  socket.emit('chat message','你现在的名字是:'+firstName)
  return guestNum+1
}
function handleDisconnct(socket,nowInRoom){
  socket.on('disconnect',function(){
    let name = nickName[socket.id]
    let num = nowInRoom.indexOf(name)
    nowInRoom.splice(num,1)
    socket.broadcast.emit('chat message',nickName[socket.id]+'下线了')
  })
}
function handleChatMsg(socket,nickName){
  socket.on('chat message',function(msg){
    io.emit('chat message', nickName[socket.id]+':'+msg)
  })
}
app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html')
})
io.on('connection',function(socket){
  //上线后看到在线人昵称
  socket.emit('chat message','当前在线有：'+nowInRoom)
  
  guestNum = assignName(socket,nickName,guestNum)
  nowInRoom.push(nickName[socket.id])
  
  //处理聊天信息
  handleChatMsg(socket,nickName)
  //下线函数
  handleDisconnct(socket,nowInRoom)
  
})

http.listen(3000,function(){
  console.log('服务开启了 在3000端口')
})