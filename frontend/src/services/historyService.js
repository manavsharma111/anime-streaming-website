import axiosInstance from "./api"

const historyService = {
    getHistory: ()=> {
        return axiosInstance.get('/history/get-history')
    },
    addHistory: (data)=> {
        return axiosInstance.post('/history/add-history', data)
    },
    deleteHistory: (id)=> {
        return axiosInstance.delete(`/history/delete-history/${id}`)
    },
    deleteAllHistory: ()=> {
        return axiosInstance.delete('/history/delete-all-history')
    }
}

export default historyService