import React, {useEffect, useRef, useState} from 'react'
import ChatBoxScreens from "../Screens/ChatBoxScreens";
import {useToasts} from "react-toast-notifications";
import {nanoid} from "nanoid";
import axios from "axios";
import { createSpeechlySpeechRecognition } from "@speechly/speech-recognition-polyfill";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

const appId = "afa75d18-0f81-4f20-9ebc-1bb59ad15210";
const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);
const ChatBoxContainer = () => {


    const {addToast} = useToasts();
    const [silviaOpen, setSilviaOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [chatText, setChatText] = useState('');
    const [micEnabled, setMicEnabled] = useState(false);
    const [isOnline, set_isOnline] = useState(true);
    const [toggleEnabled, setToggleEnabled] = useState(true);
    const [userNameToken, setUserNameToken] = useState('');
    const [userGreetMessages, setUserGreetMessages] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [playedAudio, setPlayedAudio] = useState([]);
    const [deviceName, setDeviceName] = useState('');
    const [microPermission, setMicroPermission] = useState(false);

    const { resetTranscript,transcript, listening,isMicrophoneAvailable, browserSupportsSpeechRecognition } =
        useSpeechRecognition();

    const handleShowModal = () => {

        setDeleteModalOpen(true);
    };
    const handleModalCancel = () => {
        console.log('Clicked cancel button');
        setDeleteModalOpen(false);
    };

    let interval = null;


    const handleGreetingMessages = async (guestUser, setLoading) => {
        setChatText('');
        setMicEnabled(false);
        resetTranscript();
        setPlayedAudio([]);
        const audios = [];
        await axios
            .get(`https://silviaserver.com/SilviaServer/Core/GetAll?user=${guestUser}`)
            .then((resp) => {
                if (resp?.data?.success === true) {
                    const { response } = resp?.data;
                    if (response.length > 0) {
                        setLoading(false);
                        if(toggleEnabled){
                            const messages = response[0]?.results;
                            debugger
                            if(messages[0] !== '[silence]'){
                                setUserGreetMessages((prevState) => {
                                    const latestState = [...prevState, {
                                        from: 'robot',
                                        type: 'text',
                                        message: messages[0]
                                    }]
                                    return latestState;
                                });
                            }
                            if(messages[1] !== '[silence]') {
                                const audioUrl = `http://208.109.188.242:5003/api/tts?voice=en-us/southern_english_female-glow_tts&text=${messages[1]}&vocoder=hifi_gan%2Funiversal_large&denoiserStrength=0.002&noiseScale=0.667&lengthScale=1.1&ssml=false`;
                                audios.push(audioUrl);
                            }


                            response.forEach(({ results }, index) => {
                                if (index !== 0) {
                                    results?.forEach((message, index) => {
                                        console.log('foreach 2222');
                                        if (index === 0) {
                                            if (message === '[silence]') {
                                            }else{
                                                setUserGreetMessages((prevState) => {
                                                    const latestState = [...prevState, {
                                                        from: 'robot',
                                                        type: 'text',
                                                        message: message
                                                    }]
                                                    return latestState;
                                                });
                                            }
                                        } else if (index === 1) {
                                            if (message === '[silence]') {

                                            } else {

                                                if(toggleEnabled){
                                                    const audioUrl2 = `http://208.109.188.242:5003/api/tts?voice=en-us/southern_english_female-glow_tts&text=${message}&vocoder=hifi_gan%2Funiversal_large&denoiserStrength=0.002&noiseScale=0.667&lengthScale=1.1&ssml=false`;
                                                    audios.push(audioUrl2);

                                                }

                                            }
                                        }
                                    });
                                }
                            });


                        }else{
                            response.forEach((messages, index) => {
                                const {results} = messages;
                                results.forEach((message, index) => {
                                    if (index === 0) {
                                        if (message === "[silence]") {

                                        } else {
                                            setUserGreetMessages((prevState) => {
                                                const latestState = [...prevState, {
                                                    from: 'robot',
                                                    type: 'text',
                                                    message: message
                                                }]
                                                return latestState;
                                            })
                                        }
                                    }
                                })
                            })

                        }

                        setPlayedAudio((prevState) => {
                            const latestState = [...prevState, audios];
                            return latestState;
                        });

                    }
                } else {
                    addToast('success false', { appearance: 'warning' });
                }
            })
            .catch((err) => {
                addToast(err.message, { appearance: 'error' });
                console.log(err?.message);
                setLoading(false);
            });
    };
    useEffect(()=>{

        setPlayedAudio([]);
    }, [toggleEnabled]);


    useEffect(()=>{
        if(toggleEnabled){
        var audio = new Audio(),
            i = 0;
        audio.addEventListener('ended', function () {
            console.log(i);
            audio.src = playedAudio?.[0][++i];
            audio.play();
        }, false);

            audio.loop = false;
            audio.src = playedAudio?.[0]?.[0];
            audio.play();
        }

    },[playedAudio, toggleEnabled]);




    const handleUserNameToken = async () => {

        setLoading(true);

        const data = nanoid();
        const guestUser = `guest-${data}`;

        setUserNameToken(guestUser);
        localStorage.setItem('userNameToken', guestUser);
        setToggleEnabled(true);

        await axios.get(`https://silviaserver.com/SilviaServer/Core/Create?user=${guestUser}&file=SilviaServerChat.sil`)
            .then((resp) => {

                    console.log(resp)
                if(resp?.data?.success === true){

                    handleGreetingMessages(guestUser, setLoading);
                }else{

                    addToast(resp?.data?.success , { appearance: 'warning' });

                }

                }
            )
            .catch((err) => {

                addToast(err.message , { appearance: 'error' });
                console.log(err?.message);
                setLoading(false);
            });


    }

    const InternetErrMessagenger = () => set_isOnline(navigator.onLine===true); // for do like this shortform

    useEffect(()=>{
        interval = setInterval(InternetErrMessagenger, 6000); // call the function name only not with function with call `()`
        return ()=>{
            clearInterval(interval) // for component unmount stop the interval
        }
    },[]);
    useEffect(()=> {

        if(silviaOpen === true){
            if(chatText === ''){
        const interval = setInterval(() => {
            handleGreetingMessages(userNameToken, setLoading)
        }, 4000);
        return () => clearInterval(interval);
            }
        }
    },[silviaOpen, userNameToken, chatText, setLoading]);


    const handleSilviaChat = async () => {

        setSilviaOpen(true);

        const checkLocalStorage = localStorage.getItem('userNameToken');

        if(checkLocalStorage){

        }else{
            handleUserNameToken();
        }
    }

    const handleCloseChat = async  () => {

        const checkLocalStorage = localStorage.getItem('userNameToken');

        if(checkLocalStorage){
         await axios.get(`https://silviaserver.com/SilviaServer/Core/Release?user=${checkLocalStorage}`)
              .then((resp) => {

                  setUserGreetMessages([]);
                  setDeleteModalOpen(false);
                  setSilviaOpen(false);
                  setToggleEnabled(true);
                  setChatText('');
                  localStorage.removeItem('userNameToken');
                  }
              )
              .catch((err) => {

                  console.log(err?.response)
                  addToast(err?.message, { appearance: 'error' });
                  setLoading(false);
              });
        }else{
            setSilviaOpen(false);
        }

    }

    useEffect(()=> {
        handleCloseChat();
    },[]);

    const handleSwitchChange = (checked) => {
        setToggleEnabled(!toggleEnabled);
    };
    const handleChatText = (event) => {

        const text = event.target.value;
        setChatText(text);
        setMicEnabled(false);

    };


    useEffect(()=> {
// debugger
//         if(listening === false){
//             // setMicEnabled(false);
//         }
        if(micEnabled && transcript){
            setChatText(transcript);
        }
        if(!isMicrophoneAvailable){

                setMicEnabled(false);

                // Render some fallback content
                addToast("Your microphone is not available. Please check!!!" , { appearance: 'error' });

        }
        if (!browserSupportsSpeechRecognition) {
            addToast("Browser doesn't support speech recognition." , { appearance: 'error' });
        }


    },[listening, transcript])




    const handleMicPermissions = async () => {

        if(isMicrophoneAvailable){
            if(micEnabled){
                setMicEnabled(false);
                SpeechRecognition.stopListening()
            }else{

                setMicEnabled(true);
                SpeechRecognition.startListening({ continuous: true });
            }
        }else{
            addToast('Your microphone is not available. Please check!!!', {appearance: 'error'})
        }






    }


    const handleSendMessage = async ()=>{
        setLoading(true);
        await axios.get(`https://silviaserver.com/SilviaServer/Core/SetInput?user=${userNameToken}&text=${chatText}`)
            .then((resp) => {

                    setUserGreetMessages((prevState) => {
                        const latestState = [...prevState, {from: 'me', type: 'text', message: chatText}]
                        return latestState;
                    })
                    console.log(resp);
                    setChatText('');
                    handleGreetingMessages(userNameToken, setLoading);



                }
            )
            .catch((err) => {
                addToast(err.message , { appearance: 'error' });
                setLoading(false);
            });

    }

    const handleMessages = async (e) => {

        if(e.keyCode == 13 && e.shiftKey == false) {

            e.preventDefault();
            handleSendMessage();
        }


    }

    useEffect(()=>{

        setPlayedAudio([]);

    },[toggleEnabled, silviaOpen]);



    return(
       <ChatBoxScreens
           silviaOpen={silviaOpen}
           loading={loading}
           handleSilviaChat={handleSilviaChat}
           isOnline={isOnline}
           handleChatText={handleChatText}
           chatText={chatText}
           micEnabled={micEnabled}
           handleMicPermissions={handleMicPermissions}
           handleSwitchChange={handleSwitchChange}
           handleGreetingMessages={handleGreetingMessages}
           userGreetMessages={userGreetMessages}
           handleMessages={handleMessages}
           toggleEnabled={toggleEnabled}
           // playList={playList}
           handleCloseChat={handleCloseChat}
           handleShowModal={handleShowModal}
           handleModalCancel={handleModalCancel}
           deleteModalOpen={deleteModalOpen}
           playedAudio={playedAudio}
           deviceName={deviceName}
           transcript={transcript}
           SpeechRecognition={SpeechRecognition}
           handleSendMessage={handleSendMessage}
           listening={listening}
       />
    )
}

export default ChatBoxContainer
