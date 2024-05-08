

export const reloadNewMessage = async (message_id) => {
    try {
   
        let rest = (await axios.post(`${config_backend.host}/api/chat/send.php`, {message_id},  {
            headers: {
                Authorization: getAuthorization()
            }
        })).data;

        return Promise.resolve(rest);
    }
    catch(e) {

        noteError('Нет связи с сервером')
        sendErrorToTG(`${e?.message} \n ${e?.config?.url}`)   
        return Promise.reject(e);
    }
}


export const SendToChat = async (id, userId, message, files) => {
    try {
        let params = new FormData();
        params.append("request_id", id);
        params.append("user_id", userId);
        params.append("UF_COMMENT", message);
        files.forEach(el => params.append("UF_A_FILES[]", el.file));
        
        let data = (await axios.post(`${config_backend.host}/api/chat/newMessage.php`, params, {
            headers: {
                Authorization: getAuthorization(), 
                "Content-Type": "multipart/form-data",
            }
        })).data;

        if (data.success) {
            return data;
        } else {
            noteError(data.result.message)
        }

    }
    catch(e) {
        // noteError('Нет связи с сервером')
        sendErrorToTG(`${e?.message} \n ${e?.config?.url}`)    
    }
}