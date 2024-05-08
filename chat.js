import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { GetRequests, SendToChat, reloadNewMessage, GetManagerApplication,
     GetChatsDetail, GetGeneralChat } from "../../redux/actions";
import { useParams } from 'react-router';
import "./style.scss";
import { cannotOpenChat, clone, decodeBX } from "../../misc/common"
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
import { Replay } from "@mui/icons-material";

import UploadForChat from "../../components/uploaderChat/UploadChat";
import { Close } from '@mui/icons-material';
import axios from "axios";

import {Dialog, DialogTitle } from '@mui/material';
import { ReactComponent as IconClose } from "../../assets/icons/close2.svg";
import BrowserHintModal from "./BrowserHint";

import Dialog_ConfirmDeleteFile from "../../components/dialogs/deleteFile";
import { DeleteFileForChat } from "../../redux/actions";
import { noteError, noteSuccess } from "../../components/notes/notes";
import arrow from "../../assets/icons/arrow.png"
import Wrapper from "../../layouts/Wrapper/Wrapper";
import { useGetChatsGeneralQuery } from "../../redux/reducers/chatApi";


const ChatPage = () => {
    let { idChat } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

//agent and manager chat 
const details = useSelector(state => state.details.data)

 const chatIsFetched = useSelector(state => state.chats.fetched);
const chatDetailsFetched = useSelector(state => state.details.fetched)

    const user = useSelector(state => state.account.user);
    const manager = useSelector(state => state.account.manager);
    
    const requests = useSelector(state => state.requests.data);

    const [newMsg, setNewMsg] = useState("");

    const [newMsgZeroChat, setNewMsgZeroChat] = useState("");

    const [allMsgs, setAllMsgs] = useState([]);
    const [allMsgsZeroChat, setAllMsgsZeroChat] = useState([]);

    
    const [iconState, setIconState] = useState([])
    const [files, setFiles] = useState([]); 

    const [showArrow, setShowArrow] = useState(true)


const isManager = manager && Object.keys(manager).length > 0; 

    const ref_msgContainer = useRef(null);
    const ref_newEditor = useRef(null)

    const [openPopupModal, setOpenPopupModal] = useState(false)

const { data: generalData, isLoading, error, refetch} = useGetChatsGeneralQuery()

useEffect(() => {
    let height = ref_msgContainer.current.clientHeight;
    ref_msgContainer.current.style.height = `${height - 2}px`;
    newEditorFocus();
        if(idChat !== "0" && !isManager){
        dispatch(GetChatsDetail(idChat))  

        let timerId = setInterval(() => {
            dispatch(GetChatsDetail(idChat))
    
                }, 10000);
                return () => {
                    clearInterval(timerId);
                }

    } else if(idChat !== "0" && isManager){
        dispatch(GetChatsDetail(idChat))  

        let timerId = setInterval(() => {
            dispatch(GetChatsDetail(idChat))
    
                }, 10000);
                return () => {
                    clearInterval(timerId);
                } 

    } 
},[])


    useEffect(() => {
        if (idChat !== "0" && Array.isArray(requests) && requests.length) {
            const request = requests.find(x => x.ID == idChat);
            if (!request || cannotOpenChat.indexOf(request.UF_A_STATUS.trim().toLowerCase()) != -1)
                navigate("/404");
        }
    }, [requests]);


    useEffect(() => {
        if (idChat !== "0") { // Application chats
            if (Array.isArray(details)) {
                const chatDetail = details.find(x => x.ID_CHAT == idChat);
                if (chatDetail && chatDetail.CHAT && chatDetail.CHAT.ITEMS)
                    setAllMsgs(chatDetail?.CHAT?.ITEMS);

            }
        }
    }, [details]);


useEffect(() =>{
    scrollDown()
}, [chatDetailsFetched])

   useEffect(() =>{
    scrollDown()
   }, [chatIsFetched])


   useEffect(() => {
    setTimeout(() => {scrollDown()});
}, [newMsg, newMsgZeroChat, generalData])


    const scrollDown = () => {
        try {
            document.getElementsByClassName("messagesContainer")[0].scrollTo(0, Number.MAX_SAFE_INTEGER);
        }
        catch(e){}
    }

    const newEditorFocus = () => {
        ref_newEditor.current.focus();
    }

    const handleArrowClick = () =>{
        scrollDown()
        
    }

    const reloadSend = async(message_id, index) => {
        try{
            let resp = await reloadNewMessage(message_id)
        
            let newIconStates = [...iconState]
            newIconStates[index] = false;
            setIconState(newIconStates)
        
        if(resp && resp.success === true){
            noteSuccess(resp.result.message)

            } else {
                noteError(resp.result.message)
                let newIconStates = [...iconState]
                newIconStates[index] = false;
                setIconState(newIconStates)
        }        
        }catch (e) {
        
        }
        }



        useEffect(() => {
            if(SendToChat){
                setTimeout(() => {
                    refetch()
                }, 10000)
           
            } else {
console.log("waiting");
            }
        }, [generalData])


        const sendZeroChat = async () => {
   
            if (decodeBX(newMsgZeroChat).trim() !== "") {
        
                let chat_id = idChat
                let msgs = clone(allMsgsZeroChat);
        
                msgs.push({
                    "AUTOR": "user_comment",
                    "FIO": `Отправка...`,
                    "DATE_COMMENT": moment().toISOString(),
                    "COMMENT": newMsgZeroChat, 
                    "SEND_TO_IBSO": 1, 
                    'chat_id': chat_id,
                    "UF_A_FILES" :files.length > 0 ? files.map(file => ({
                        name: file.name, 
                        url: URL.createObjectURL(file.file)
                    })) :[]
        
                });


                setAllMsgsZeroChat(msgs);
                
                setTimeout(() => {newEditorFocus()}, 10);
                SendToChat(idChat, user.ID, newMsgZeroChat,files);
        
                setIconState([...iconState, false])
                setNewMsgZeroChat("");
                setFiles([])

                if(window.ym){
                    window.ym(82235653,'reachGoal','send_soobscheniye')
                }
await SendToChat();
refetch()
            }
        }


       
    
const sendMessage = () => {
    let chat_id = idChat
    let msgs = clone(allMsgs);
    let files = []
    for (let file of document.querySelectorAll("[type='file']")) {

        const bxField = file.getAttribute("x-data-bx-field");
        if (file.files.length)
            for (let f of file.files)
                files.push({         
                    file: f
                });


    msgs.push({
        "AUTOR": "user_comment",
        "FIO": `Отправка...`,
        "DATE_COMMENT": moment().toISOString(),
        "COMMENT": newMsg, 
        "SEND_TO_IBSO": 1, 
        'chat_id': chat_id, 
        "UF_A_FILES" :files.length > 0 ? files.map(file => ({
            name: file.name, 
            url: URL.createObjectURL(file.file)
        })) :[]
    });

    setAllMsgs(msgs);
    setTimeout(() => {newEditorFocus()}, 10);
    SendToChat(idChat, user.ID, newMsg, files);
    setIconState([...iconState, false])
    setNewMsg("")
    setFiles([])


    if(window.ym){
        window.ym(82235653,'reachGoal','send_soobscheniye')
    }
}
}


const onDeleteFile = async (fileId) => {
    try{
        const result = await DeleteFileForChat(idChat, fileId)
        if(result.success){
            const updateMsgs = allMsgs.map((msg) => {
                if(msg.UF_A_FILES){
                    msg.UF_A_FILES = msg.UF_A_FILES.filter((file) => file.id !== fileId); 
    
                }
                return msg
            })
            setAllMsgs(updateMsgs)
            noteSuccess(result.result.message)

    
        } else {
            noteError('Не удалось удалить файл')

        }
    } catch (e){
        console.error("Ошибка удаления файла", e);
    }
    
    
        //delete name for state
    
        
    }

    const onApproveConfirm = () => {
        if (fileId) {
            onDeleteFile(fileId);
            onCloseConfirm();
        }
    }

    const onOpenConfirm = (id) => {
        setOpenConfirm(true);
        setFileId(id);
    }
    
    const onCloseConfirm = () => {
        setOpenConfirm(false);
        setFileId(null);
    }


const handleInputChange = (e) => {
    setNewMsg(e.target.value)
}


const handleInputChangeZeroChat = (e) => {
    setNewMsgZeroChat(e.target.value)
}

const handleKeyPress = (e) => {
    if (!e.ctrlKey && e.keyCode == 13) {
        e.preventDefault()
        sendMessage()
    }
}

const handleKeyPressZeroChat = (e) => {
    if (!e.ctrlKey && e.keyCode == 13) {
        e.preventDefault()
        sendZeroChat()
    }
}


    return (
<>
<Wrapper>

<div className="buttonsPanel">
                <Button variant="contained" color="secondary" className="back" onClick={() => navigate(-1)}>Назад</Button>
            </div>

        <div className="chatContainer">
   
            <div className="chatBox">
            {isManager ? (
                <div className="header">
                <div className="title">{manager && manager.NAME}</div>
                
                <div className="description">Менеджер</div>

            </div>
) : null}


            <div className="container">
            <div ref={ref_msgContainer} className="messagesContainer">

 {idChat === "0" ? (
                    <>



                    
                    { generalData && generalData.map((x, i) => {
        
                   let letters = "";
                        let fio = typeof x.FIO === "string" ? x.FIO : x.UF_FIO;
                        let comment = typeof x.COMMENT === "string" ? x.COMMENT : x.UF_COMMENT;
                        let type = x.AUTOR && x.AUTOR == "user_comment" ? "outcome" : "income";


if(loadingMessage === true){
    if (x.FIO === "Отправка...") {
        letters = "...";
    }    
    else {
        let words = fio.split(" ");
        letters = words.length >= 2 ? `${words[0].trim().charAt(0).toUpperCase()}${words[1].trim().charAt(0).toUpperCase()}` : (words.length && words[0].trim() != "" ? words[0].trim().charAt(0).toUpperCase() : "--");
    }
    
}
  
          

return (
// если SEND_TO_IBSO ноль то этот блок
 <div key={`msgRow_${x.DATE_COMMENT}`} className={`row ${type}`}>
           
{x.SEND_TO_IBSO === '0' ? (
    <>
    <h1> {x.SEND_TO_IBSO} </h1> 
    <div className={`message ${type}`}>
    <div className="messageHeader">
    <div className="from">{fio}</div>
    <div className="dot" />
    <div className="date">{moment(x.DATE_COMMENT).format("DD.MM.YYYY HH:mm")}</div>
    <div className="dot hide" />
    <div className="replay hide">Ответить</div>

    </div>

<div className="text" dangerouslySetInnerHTML={{__html: comment}} />
<p className="errorMsg">Ошибка отправки сообщения</p>
</div>
<Replay 
onClick={() => {
    let newIconStates = [...iconState];
    newIconStates[i] = true;
    setIconState(newIconStates)
    reloadSend(x.ID, i)
}} 

className = {iconState[i] ? 'loading' : ''}/>    
{type == "outcome" ? <div className={`avatar ${type}`}>{letters}</div> : null}
    </>

) : (
    <>
        <h1> {x.SEND_TO_IBSO} </h1> 

{type == "income" ? <div className={`avatar ${type}`}>{letters}</div> : null}
<div className={`message ${type}`}>
<div className="messageHeader">
<div className="from">{fio}</div>
<div className="dot" />
<div className="date">{moment(x.DATE_COMMENT).format("DD.MM.YYYY HH:mm")}</div>
<div className="dot hide" />
<div className="replay hide">Ответить</div>
</div>
<div className="text" dangerouslySetInnerHTML={{__html: comment}} />
</div>    
{type == "outcome" ? <div className={`avatar ${type}`}>{letters}</div> : null}
    </>

)}
</div> 
  )})
}

 </>
 ): (


 <>    
{/* это чат по заявкам с возможностью крепить файлы  */}

{ allMsgs.map((x, i) => {
                        let letters = "";
                        let fio = typeof x.FIO === "string" ? x.FIO : x.UF_FIO;
                        let comment = typeof x.COMMENT === "string" ? x.COMMENT : x.UF_COMMENT;

                        if (x.FIO === "Отправка..." ) {
                            letters = "...";
                        }
                        
                        //это картинка в окошке
                        else {
                            let words = fio.split(" ");
                            letters = words.length >= 2 ? `${words[0].trim().charAt(0).toUpperCase()}
                            ${words[1].trim().charAt(0).toUpperCase()}`
                     : (words.length && words[0].trim() != ""  ? words[0].trim().charAt(0).toUpperCase() : "--");
                        }
                        let type = x.AUTOR && x.AUTOR == "user_comment" ? "outcome" : "income";
            
return (
 
// если SEND_TO_IBSO ноль то этот блок
 <div key={`msgRow_${x.DATE_COMMENT}`} className={`row ${type}`}>
{x.SEND_TO_IBSO === '0' ? (
    <>
    <div className={`message ${type}`}>
    <div className="messageHeader">
    <div className="from">{fio}</div>

    <div className="dot" />
    <div className="date">{moment(x.DATE_COMMENT).format("DD.MM.YYYY HH:mm")}</div>
    <div className="dot hide" />
    <div className="replay hide">Ответить</div>
    </div>

<div className="text" dangerouslySetInnerHTML={{__html: comment}} />
<p className="errorMsg">Ошибка отправки сообщения</p>


{x.UF_A_FILES && x.UF_A_FILES.length > 0 ? (
    
    <div className="imageContauner">
{x.UF_A_FILES.map((file, index) => (
<a className="imgFile"  target="_blank" key={`image_${index}`} href={file.location}>{file.origin_name}</a>
))}
    </div>
) : null}

</div>
<Replay 
onClick={() => {
    let newIconStates = [...iconState];
    newIconStates[i] = true;
    setIconState(newIconStates)
        reloadSend(x.ID, i)

   
}} 
className = {iconState[i] ? 'loading' : ''}
/>    
{type == "outcome" ? <div className={`avatar ${type}`}>{letters}</div> : null}
    </>
) : (
    <>
{type == "income" ? <div className={`avatar ${type}`}>{letters}</div> : null}
<div className={`message ${type}`}>
<div className="messageHeader">
<div className="from">{fio}</div>
<div className="dot" />
<div className="date">{moment(x.DATE_COMMENT).format("DD.MM.YYYY HH:mm")}</div>
<div className="dot hide" />
<div className="replay hide">Ответить</div>
</div>




<div className="text" dangerouslySetInnerHTML={{__html: comment}} />


{x.UF_A_FILES && x.UF_A_FILES.length > 0 ? (
    <div className="imageContauner">
{x.UF_A_FILES.map((file, index) => (

<div className=" imgBox">

{x.FIO === "Отправка..." ? (
<a className="imgFile" target="_blank" key={`image_${index}`} href={file.location}>{file.origin_name}</a>

) : (

<>
<a className="imgFile" target="_blank" key={`image_${index}`} href={file.location}>{file.origin_name}</a>

<IconClose className={`close ${file && file.canDelete}`}
onClick={() => onOpenConfirm(file.id)} 
   />
       <Dialog_ConfirmDeleteFile
        isOpen={open_confirm} 
       fileName={file.origin_name} 
       onClose={onCloseConfirm}
        onApprove={onApproveConfirm} 
        />

</>
)

}

</div> 

))}

<div className="downloadbox">

<button className="downloadFiles" 
onClick={() => {
    handleDownloadFiles(x.UF_A_FILES)
}}
> 
Скачать файлы
</button>

<div className="helpTip" role='tooltip' id='name-tooltip' onClick={openPopup}> </div>
    </div>


    <Dialog onClose={handleClosePopup} open={openPopupModal} className="dialogHint">
                <DialogTitle>Подзказка
                    <div className="closeContainer"><IconClose className="close"
                 onClick={handleClosePopup}/></div></DialogTitle>
                <BrowserHintModal/>
            </Dialog>

</div>



) : null}


</div>    
{type == "outcome" ? <div className={`avatar ${type}`}>{letters}</div> : null}
    </>

)}
</div> 
  )})
}
    </>
 )
 }

 </div>
  
  {/* ///////////////////////message editor //////////////////////// */}


  <div className="wysiwygContainer">
  {allMsgs.length > 10 ||generalData && generalData.length > 10 && showArrow ? (
        <div className="arrowContainer" onClick={handleArrowClick}>
        <img className="arrow" src={arrow}/>
        </div>
): (
""
    )}

{idChat!=="0" ? (

<div className="message-editor">
{idChat !== "0" &&(
    <div  className="dropbox">
    <UploadForChat
    files={files}
    setFiles={setFiles}
    name="otherFiles" 
    bxField="UF_A_FILES" noComments/>
    </div>
)}
<textarea placeholder="Введите сообщение..."
 ref={ref_newEditor}
value={newMsg}
onChange={handleInputChange}
onKeyDown={handleKeyPress}
>

</textarea>

<Button className="sendMsg"  variant="outlined"
 color="primary" onClick={sendMessage}> Отправить </Button>           

</div>


) :  (

//--------------------------------ZERO CHAT------------------------
<div className="messageeditorZeroChat">
<textarea placeholder="Введите сообщение..."
 ref={ref_newEditor}
value={newMsgZeroChat}
onChange={handleInputChangeZeroChat}
onKeyDown={handleKeyPressZeroChat}
>
</textarea>

<Button className="sendMsg"  variant="outlined"
 color="primary" onClick={sendZeroChat}> Отправить </Button>           

</div>
) } 

 </div>


            </div>
            </div>
        </div>
        </Wrapper>

        </>
    );
}

export default ChatPage;
