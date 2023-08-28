// Chat.js
import React, { useState, useEffect, useRef } from 'react'
import { useAvatar } from '@avatechai/avatars/react'
import { defaultAvatarLoaders } from '@avatechai/avatars/default-loaders'
import {
  extractEmotionFromPrompt,
  removeEmotionFromPrompt,
} from '@avatechai/avatars'
import { ElevenLabsVoiceService } from '@avatechai/avatars/voice'
import { Button } from "@nextui-org/button";
import { motion, AnimatePresence } from "framer-motion"

const elevenLabs = new ElevenLabsVoiceService(
  process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY,
  'eleven_monolingual_v1',
  process.env.NEXT_PUBLIC_GOD_FATHER_VOICE_ID
)

export default function Chat() {
  const [emotions, setEmotions] = useState()
  const [sayMessage, setSayMessage] = useState([])
  const [soulThoughts, setSoulThoughts] = useState([])
  const [message, setMessage] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [AIMessage, setAIMessage] = useState('')
  const [AIThoughts, setAIThoughts] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    ; (async () => {
      if (userMessage == '' || emotions.length <= 0) return
      const { message, thoughts, feels } = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ newMessage: userMessage, emotions }),
      }).then((res) => res.json())
      setSayMessage([...sayMessage, { text: message, sender: 'soul' }])
      setSoulThoughts([
        ...soulThoughts,
        ...thoughts.map((thought) => ({
          text: thought,
          sender: 'soul',
        })),
        { text: 'I sent the message: ' + message, sender: 'soul' },
      ])
    })()
  }, [userMessage, emotions])

  useEffect(() => {
    if (sayMessage.length <= 0) return
    const messageee = sayMessage?.findLast(
      (message) => message.sender === 'soul'
    )?.text
    setAIMessage(messageee)
  }, [sayMessage])

  useEffect(() => {
    if (soulThoughts.length <= 0) return
    const thoughts = soulThoughts?.findLast(
      (message) => message.sender === 'soul'
    )?.text
    setAIThoughts(thoughts)
  }, [soulThoughts])

  const soulMessagesEndRef = useRef(null)

  const handleSendMessage = (event) => {
    event.preventDefault()
    if (message == '') return
    handleFirstInteractionAudio()
    setSayMessage([...sayMessage, { text: message, sender: 'user' }])
    setUserMessage(message)
    if (message.trim() !== '') {
      setMessage('')
    }
  }

  const scrollToBottomThoughts = () => {
    soulMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottomThoughts()
  }, [soulThoughts])

  const handleMessageChange = (event) => {
    setMessage(event.target.value)
  }

  const lastMessage = removeEmotionFromPrompt(AIMessage)

  const emotion = extractEmotionFromPrompt(AIThoughts, emotions)
  const { avatarDisplay, availableEmotions, handleFirstInteractionAudio } =
    useAvatar({
      currentEmotion: emotion,
      text: lastMessage,
      avatarLoaders: defaultAvatarLoaders,
      avatarId: '8758f800-b0e0-43c1-996b-620c2295fb0d',
      className: 'xl:!w-[480px] xl:!h-[480px] !w-[300px] !h-[300px]',
      audioService: elevenLabs,
      onAvatarLoaded: () => {
        handleFirstInteractionAudio()
      },
    })

  useEffect(() => {
    setEmotions(availableEmotions)
  }, [availableEmotions])

  return (
    <div className='min-h-screen relative flex justify-center'>
      <AnimatePresence>
        {
          !open ?
            (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex relative w-full'
                >
                  <img
                    src='https://avatech-avatar-dev1.nyc3.cdn.digitaloceanspaces.com/public-download/sdk/godfather_background.webp'
                    alt=''
                    className='w-full h-full flex justify-center absolute object-cover aspect-auto'
                  />
                  <div className='flex flex-col gap-10 w-full h-screen justify-center items-center relative'>
                    <div className='sm:text-6xl text-3xl'>
                      Start Your Business
                    </div>
                    <Button
                      onClick={() => setOpen(!open)}
                      radius="full"
                      className="relative bg-gradient-to-r from-slate-100 via-gray-800 to-black text-white overflow-visible rounded-full px-12 shadow-xl bg-background/30 after:content-[''] after:absolute after:rounded-full after:inset-0 after:bg-background/40 after:z-[-1] after:transition after:!duration-500 hover:after:scale-150 hover:after:opacity-0"
                    >
                      Start
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )
            :
            (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex relative w-full justify-center'
              >
                <img
                  src='https://avatech-avatar-dev1.nyc3.cdn.digitaloceanspaces.com/public-download/sdk/godfather_background.webp'
                  alt=''
                  className='w-full h-full flex justify-center absolute object-cover aspect-auto'
                />
                <div className='flex flex-col xl:flex-row py-6 items-center justify-center gap-6 relative'>
                  <div className='rounded-2xl flex w-full justify-center overflow-hidden'>
                    {avatarDisplay}
                  </div>
                  <div className='flex md:flex-row flex-col-reverse relative justify-center w-full'>
                    <Messages
                      handleMessageChange={handleMessageChange}
                      message={message}
                      messages={sayMessage}
                      handleSendMessage={handleSendMessage}
                    />
                    <SoulThoughts
                      soulThoughts={soulThoughts}
                      soulMessagesEndRef={soulMessagesEndRef}
                    />
                    <div className='absolute w-full h-full max-h-[534px] flex bg-white bg-opacity-40 rounded-2xl blur'>
                      <div className=''></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
        }
      </AnimatePresence>
    </div>
  )
}

function Messages({
  handleMessageChange,
  message,
  messages,
  handleSendMessage,
}) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setTimeout(() => scrollToBottom(), 100)
    setTimeout(() => scrollToBottom(), 250)
  }, [messages])

  return (
    <div className='rounded-2xl shadow-md p-6 max-w-md w-full md:w-96 relative'>
      <h1 className='text-xl font-semibold mb-4 text-center text-white relative z-10'>
        Share with God Father
      </h1>
      <div className='flex flex-col space-y-4 max-h-48 md:max-h-96 h-96 overflow-y-auto mb-4 min-h-40 hide-scrollbar z-10 relative'>
        {messages &&
          Object.entries(messages).map(([key, message], index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'soul' ? '' : 'justify-end'
                }`}
            >
              {message.sender === 'soul' && (
                <img
                  src={'/godfather.png'}
                  style={{
                    height: '35px',
                    width: '35px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    marginRight: 7,
                    marginTop: 2,
                  }}
                  alt='description'
                />
              )}
              <div
                className={`${message.sender === 'soul'
                  ? 'bg-gray-200 text-black'
                  : 'bg-gray-700 text-white'
                  } px-4 py-2 rounded-lg shadow-md`}
              >
                {removeEmotionFromPrompt(message.text)}
              </div>
            </div>
          ))}
        <div />
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className='flex items-center space-x-4 relative z-10 sm:flex-row flex-col'
      >
        <input
          type='text'
          className='text-white bg-black w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-white'
          placeholder='Type your message here...'
          value={message}
          onChange={handleMessageChange}
        />
        <Button
          type='submit'
          className='rounded-lg bg-gradient-to-t from-gray-700 to-black text-white px-4 py-2 font-semibold focus:outline-none focus:ring-2'
        >
          Send
        </Button>
      </form>
    </div>
  )
}

function SoulThoughts({ soulThoughts, soulMessagesEndRef }) {
  return (
    <div className='flex bg-white bg-opacity-0 rounded-lg w-full sm:w-96 relative z-10'>
      <div className='h-full overflow-y-auto ml-10 sm:w-96 mx-auto hide-scrollbar'>
        <div className='flex-col space-y-4 overflow-y-auto hide-scrollbar pt-10 md:pb-40 mr-4 max-h-48 md:max-h-[534px]'>
          {soulThoughts.length > 0 ? (
            soulThoughts.map((message, index) => {
              if (message.text == '') return
              return (
                <div
                  key={index}
                  className={`flex ${message.sender === 'soul' ? '' : 'justify-end'
                    }`}
                >
                  <div
                    className={`text-black bg-purple-100 bg-opacity-50 px-4 py-2 rounded-[35px] shadow-sm opacity-0 transition-all duration-500 ease-in-out animate-fade-in`}
                  >
                    {message.text}
                  </div>
                </div>
              )
            })
          ) : (
            <div className={`flex`}>
              <div
                className={`text-black bg-purple-100 bg-opacity-50 px-4 py-2 rounded-[35px] shadow-sm opacity-0 transition-all duration-500 ease-in-out animate-fade-in`}
              >
                ......
              </div>
            </div>
          )}
          <div ref={soulMessagesEndRef} />
        </div>
      </div>
    </div>
  )
}
