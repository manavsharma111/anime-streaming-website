import  {io} from 'socket.io-client'

let socket = null


const socketService = {
    getSocket: () => {
        if(!socket) {
            socket = io(import.meta.env.VITE_BASE_URL,{
                withCredentials: true,
                transports: ["websocket","polling"],
                
            })
            socket.on("connect", () => {
                console.log("Connected to server", socket.id)
            })
            socket.on("disconnect", () => {
                console.log("Disconnected from server")
            })
            socket.on("error", (error) => {
                console.log("Socket error:", error)
            })
            socket.on("connect_error", (error) => {
                console.log("Socket connect error:", error)
            })
            socket.on("reconnect", () => {
                console.log("Reconnected to server")
            })
            socket.on("reconnect_error", (error) => {
                console.log("Socket reconnect error:", error)
            })
        }
        return socket
    },
    // new episode callback
    onNewEpisode: (callback) => {
        socket.on("newEpisode", callback)
    },
    // delete episode callback
    onVideoReady: (callback) => {
        socket.on("video-status-update", callback)
    },
    onNewNotification: (callback) => {
        socket.on("new-notification", callback)
    },
    off: (event)=>{
        socket.off(event)
    },

    disconnect: () => {
        if(socket) {
            socket.disconnect()
            socket = null
        }
    }
}

export default socketService