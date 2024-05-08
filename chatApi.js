

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config_backend from '../../configs/backend.json'
import { getAuthorization } from "../../functions/getAuthorization";
import { noteUpdateError, noteUpdateSuccess, toastInit } from '../../components/notes/noteAsync';
import axios from "axios";
import sendErrorToTG from '../../functions/sendErrorToTG';

export const chatApi = createApi({
    reducerPath: 'chatApi',
    endpoints: (builder) => ({
        getChatsGeneral: builder.query({
            queryFn: async (arg) => {
                let tst
                // arg === 1 ?  tst = toastInit('Ищем сообщения') : tst = toastInit('Загружаю сообщения') 
                try {
                    
                    const response = await axios.get(`${config_backend.host}/api/chat/chatGeneral.php`, {
                        headers: {
                            Authorization: getAuthorization()
                        }
                    });
                    // console.log(response.data)
                    if(response.data.success) {
                        // noteUpdateSuccess(tst, 'Сообщения загружены')
                        return {data: await response.data.result.data };
                    } else {
                        console.log('!success')
                        noteUpdateError(tst, response?.data?.result?.message)
                        sendErrorToTG(`${response?.data?.result?.message} \n /api/news/get.php`)
                        return {error: [] };
                    }
                    
                } catch (e) {
                    console.log({e})
                    noteUpdateError(tst, 'Нет связи с сервером')
                    return { error: 'e.message' };
                }
            },
        }),
    }),
});
 export const {useGetChatsGeneralQuery} = chatApi; 

