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

    useEffect(()=> {

        console.log( navigator?.userAgent);
        let userAgentDevice =  navigator?.userAgent;

        if(userAgentDevice?.includes('Android')){
            setDeviceName('android');
        }else if(userAgentDevice?.includes('iPhone')){
            setDeviceName('ios')
        }


    },[])

    const handleShowModal = () => {

        setDeleteModalOpen(true);
    };
    const handleModalCancel = () => {
        console.log('Clicked cancel button');
        setDeleteModalOpen(false);
    };

    let interval = null;

    // const handleGreetingMessages = async (guestUser, setLoading) => {
    //     setChatText('');
    //     resetTranscript();
    //     setMicEnabled(false);
    // await axios
    //     .get(`https://silviaserver.com/SilviaServer/Core/GetAll?user=${guestUser}`)
    //     .then((resp) => {
    //         if (resp?.data?.success === true) {
    //             const { response } = resp?.data;
    //             if (response.length > 0) {
    //                 setLoading(false);
    //                 if(toggleEnabled){
    //                     const messages = response[0]?.results;
    //                     if(messages[0] !== '[silence]'){
    //                         setUserGreetMessages((prevState) => {
    //                             const latestState = [...prevState, {
    //                                 from: 'robot',
    //                                 type: 'text',
    //                                 message: messages[0]
    //                             }]
    //                             return latestState;
    //                         });
    //                     }
    //
    //                     const audioUrl = `http://208.109.188.242:5003/api/tts?voice=en-us/southern_english_female-glow_tts&text=${messages[1]}&vocoder=hifi_gan%2Funiversal_large&denoiserStrength=0.002&noiseScale=0.667&lengthScale=0.85&ssml=false`;
    //
    //
    //                     let audio = new Audio(audioUrl);
    //                     audio.play();
    //
    //                     audio.onended = function () {
    //                         response.forEach(({ results }, index) => {
    //                             if (index !== 0) {
    //                                 results?.forEach((message, index) => {
    //                                     if (index === 0) {
    //                                         if (message === '[silence]') {
    //                                         }else{
    //                                             setUserGreetMessages((prevState) => {
    //                                                 const latestState = [...prevState, {
    //                                                     from: 'robot',
    //                                                     type: 'text',
    //                                                     message: message
    //                                                 }]
    //                                                 return latestState;
    //                                             });
    //                                         }
    //                                     } else if (index === 1) {
    //                                         if (message === '[silence]') {
    //                                         } else {
    //                                             if(toggleEnabled){
    //                                                 const audioUrl2 = `http://208.109.188.242:5003/api/tts?voice=en-us/southern_english_female-glow_tts&text=${message}&vocoder=hifi_gan%2Funiversal_large&denoiserStrength=0.002&noiseScale=0.667&lengthScale=0.85&ssml=false`;
    //                                                 let audio = new Audio(audioUrl2);
    //                                                 audio.play();
    //                                             }
    //
    //                                         }
    //                                     }
    //                                 });
    //                             }
    //                         });
    //                     };
    //
    //                 }else{
    //                     response.forEach((messages, index) => {
    //                         const {results} = messages;
    //                         results.forEach((message, index) => {
    //                             if (index === 0) {
    //                                 if (message === "[silence]") {
    //
    //                                 } else {
    //                                     setUserGreetMessages((prevState) => {
    //                                         const latestState = [...prevState, {
    //                                             from: 'robot',
    //                                             type: 'text',
    //                                             message: message
    //                                         }]
    //                                         return latestState;
    //                                     })
    //                                 }
    //                             }
    //                         })
    //                     })
    //
    //                 }
    //
    //
    //
    //
    //
    //             }
    //         } else {
    //             addToast('success false', { appearance: 'warning' });
    //         }
    //     })
    //     .catch((err) => {
    //         addToast(err.message, { appearance: 'error' });
    //         console.log(err?.message);
    //         setLoading(false);
    //     });
    // };


    const handleGreetingMessages = async (guestUser, setLoading) => {
        setChatText('');
        setMicEnabled(false);
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
                            // setPlayedAudio((prevState) => {
                            //     const latestState = [...prevState, {url: audioUrl}];
                            //     return latestState;
                            // });
                            //



                            //let audio = new Audio(audioUrl);
                            //audio.play();

                            //audio.onended = function () {
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
                                                debugger
                                            } else {
                                                debugger
                                                if(toggleEnabled){
                                                    const audioUrl2 = `http://208.109.188.242:5003/api/tts?voice=en-us/southern_english_female-glow_tts&text=${message}&vocoder=hifi_gan%2Funiversal_large&denoiserStrength=0.002&noiseScale=0.667&lengthScale=1.1&ssml=false`;
                                                    audios.push(audioUrl2);
                                                    // setPlayedAudio((prevState) => {
                                                    //     const latestState = [...prevState, {url: audioUrl2}];
                                                    //     return latestState;
                                                    // });
                                                    // debugger

                                                    console.log(playedAudio, "++++++++");
                                                    //let audio = new Audio(audioUrl2);
                                                    //audio.play();
                                                }

                                            }
                                        }
                                    });
                                }
                            });
                            //};

                        }else{
                            response.forEach((messages, index) => {
                                console.log('foreach 1111');
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
                        console.log('audios files =====>>>');

                        //
                        // audios.push(`http://208.109.188.242:5003/api/tts?voice=en-us/southern_english_female-glow_tts&text=hello world&vocoder=hifi_gan%2Funiversal_large&denoiserStrength=0.002&noiseScale=0.667&lengthScale=0.85&ssml=false`);
                        // audios.push(`http://208.109.188.242:5003/api/tts?voice=en-us/southern_english_female-glow_tts&text=hello Sajid&vocoder=hifi_gan%2Funiversal_large&denoiserStrength=0.002&noiseScale=0.667&lengthScale=0.85&ssml=false`);
                        // audios.push(`http://208.109.188.242:5003/api/tts?voice=en-us/southern_english_female-glow_tts&text=hello helloooo&vocoder=hifi_gan%2Funiversal_large&denoiserStrength=0.002&noiseScale=0.667&lengthScale=0.85&ssml=false`);

                        console.log(`audo lenght => ${audios}`);
                        console.log(audios);
                        setPlayedAudio((prevState) => {
                            const latestState = [...prevState, audios];
                            return latestState;
                        });

                        // var audio = new Audio(),
                        //     i = 0;
                        //var playlist = new Array('http://www.w3schools.com/htmL/horse.mp3', 'http://demos.w3avenue.com/html5-unleashed-tips-tricks-and-techniques/demo-audio.mp3');

                        // audio.addEventListener('ended', function () {
                        //     console.log(i);
                        //     audio.src = audios[++i];
                        //     audio.play();
                        //     // audios.splice(i-1,1);
                        // }, true);
                        //
                        //     audio.loop = false;
                        //     audio.src = audios[0];
                        //     audio.play();

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
        debugger
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

    console.log(playedAudio, "player++++");
    const InternetErrMessagenger = () => set_isOnline(navigator.onLine===true); // for do like this shortform

    useEffect(()=>{
        interval = setInterval(InternetErrMessagenger, 6000); // call the function name only not with function with call `()`
        return ()=>{
            clearInterval(interval) // for component unmount stop the interval
        }
    },[]);
    // useEffect(()=> {
    //     debugger
    //     if(silviaOpen === true){
    //         if(chatText === ''){
    //     const interval = setInterval(() => {
    //         handleGreetingMessages(userNameToken, setLoading)
    //     }, 4000);
    //     return () => clearInterval(interval);
    //         }
    //     }
    // },[silviaOpen, userNameToken, chatText, setLoading]);


    const handleSilviaChat = async () => {

        setSilviaOpen(true);

        const checkLocalStorage = localStorage.getItem('userNameToken');

        if(checkLocalStorage){
            // const release = await fetch(`http://162.244.80.91:10870/SilviaServer/Core/Release?user=${checkLocalStorage}`, {
            //     method: "get",
            //     headers: {
            //         "Content-Type": "application/json",
            //         "x-access-token": "token-value",
            //         'Access-Control-Allow-Origin': '*',
            //     },
            // })
            // const headers = {
            //     "Content-Type": "application/json",
            //     "x-access-token": "token-value",
            //     'Access-Control-Allow-Origin': '*',
            // }
            //
            // const res =   axios.get(`/SilviaServer/Core/Release?user=${checkLocalStorage}`, {headers} )
            //       .then((resp) => {
            //           debugger
            //           console.log(resp)
            //
            //
            //           }
            //       )
            //       .catch((err) => {
            //          debugger
            //           console.log(err?.response)
            //       });

            // localStorage.removeItem('userNameToken');
        }else{
            handleUserNameToken();
        }
    }

    const handleCloseChat = async  () => {

        const checkLocalStorage = localStorage.getItem('userNameToken');

        if(checkLocalStorage){
         await axios.get(`https://silviaserver.com/SilviaServer/Core/Release?user=${checkLocalStorage}`)
              .then((resp) => {

                  console.log(resp);
                  setUserGreetMessages([]);
                  setDeleteModalOpen(false);
                  setSilviaOpen(false);
                  setToggleEnabled(true);
                  setChatText('');
                  // addToast("Chat Closed Successfully" , { appearance: 'success' });
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
        console.log(`switch to ${checked}`);
        setToggleEnabled(!toggleEnabled);
    };
    const handleChatText = (event) => {

        const text = event.target.value;
        setChatText(text);
        setMicEnabled(false);

    };
    //
    // const {
    //     transcript,
    //     listening,
    //     resetTranscript,
    //     browserSupportsSpeechRecognition,
    //     isMicrophoneAvailable
    // } = useSpeechRecognition();

    useEffect(()=> {
debugger
        if(listening === false){
            // setMicEnabled(false);
        }
        if(micEnabled && transcript){
            setChatText(transcript);
            console.log(chatText);
        }
        if(!isMicrophoneAvailable){
                // setMicroPermission(true);
                setMicEnabled(false);
                debugger
                // Render some fallback content
                addToast("Your microphone is not available. Please check!!!" , { appearance: 'error' });

        }
        if (!browserSupportsSpeechRecognition) {
            addToast("Browser doesn't support speech recognition." , { appearance: 'error' });
        }


    },[listening, transcript])




    const handleMicPermissions = async () => {
        debugger
        if(isMicrophoneAvailable){
            if(micEnabled){
                debugger
                setMicEnabled(false);
                SpeechRecognition.stopListening()
            }else{
                debugger
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
                console.log(err?.message);
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
