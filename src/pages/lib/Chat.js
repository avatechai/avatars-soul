// Chat.js
import React, { useState, useEffect, useRef } from 'react'
import { useAvatar } from '@avatechai/avatars/react'
import { defaultAvatarLoaders } from '@avatechai/avatars/default-loaders'
import {
  extractEmotionFromPrompt,
  removeEmotionFromPrompt,
} from '@avatechai/avatars'
import { ElevenLabsVoiceService } from '@avatechai/avatars/voice'

const elevenLabs = new ElevenLabsVoiceService(
  process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
  'eleven_monolingual_v1',
  'biiTjdAywMak7MF2w2US'
)

export default function Chat() {
  const [emotions, setEmotions] = useState()
  const [sayMessage, setSayMessage] = useState([])
  const [soulThoughts, setSoulThoughts] = useState([])
  const [message, setMessage] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [AIMessage, setAIMessage] = useState('')
  const [AIThoughts, setAIThoughts] = useState('')
  useEffect(() => {
    ;(async () => {
      if (userMessage == '' || emotions.length <= 0) return
      const { message, thoughts, feels } = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ newMessage: userMessage, emotions }),
      }).then((res) => res.json())
      setSayMessage([...sayMessage, { text: message, sender: 'soul' }])
      setSoulThoughts([...soulThoughts, { text: thoughts, sender: 'soul' }])
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
    handleFirstInteractionAudio()
    setSayMessage([...sayMessage, { text: message, sender: 'user' }])
    setUserMessage(message)
    // tellSoul(message)
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
      className: '!w-[300px] !h-[300px] ',
      audioService: elevenLabs,
      onAvatarLoaded: () => {
        handleFirstInteractionAudio()
      },
    })

  useEffect(() => {
    setEmotions(availableEmotions)
  }, [availableEmotions])

  return (
    <div className='min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 relative flex justify-center'>
      <div className='flex flex-col container px-4 py-6 items-center justify-center gap-6 relative'>
        <h1
          className={`text-4xl text-white font-semibold mb-4 text-center orbitron absolute top-16 left-5`}
        >
          Social AGI
        </h1>
        <div className='rounded-2xl border-dashed border-2 border-white flex overflow-hidden'>
          {avatarDisplay}
        </div>
        <div className='flex flex-row'>
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
        </div>
      </div>
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
    <div className='bg-white rounded-lg shadow-md p-6 max-w-md w-96'>
      <h1 className='text-xl font-semibold mb-4 text-center'>
        Share with Samantha
      </h1>
      <div className='flex flex-col space-y-4 h-96 overflow-y-auto mb-4 min-h-40 hide-scrollbar'>
        {messages &&
          Object.entries(messages).map(([key, message], index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'soul' ? '' : 'justify-end'
              }`}
            >
              {message.sender === 'soul' && (
                <img
                  src={'/samantha.png'}
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
                className={`${
                  message.sender === 'soul'
                    ? 'bg-purple-200 text-black'
                    : 'bg-purple-600 text-white'
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
        className='flex items-center space-x-4'
      >
        <input
          type='text'
          className='text-black w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-600'
          placeholder='Type your message here...'
          value={message}
          onChange={handleMessageChange}
        />
        <button
          type='submit'
          className='rounded-lg bg-purple-600 text-white px-4 py-2 font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600'
        >
          Send
        </button>
      </form>
    </div>
  )
}

function SoulThoughts({ soulThoughts, soulMessagesEndRef }) {
  return (
    <div className='flex bg-white bg-opacity-0 rounded-lg w-96'>
      <div className='h-full overflow-y-auto ml-10 w-96 mx-auto hide-scrollbar'>
        <div className='flex-col space-y-4 overflow-y-auto hide-scrollbar pb-60 mr-4'>
          {soulThoughts.length > 0 ? (
            soulThoughts.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === 'soul' ? '' : 'justify-end'
                }`}
              >
                <div
                  className={`text-white bg-purple-100 bg-opacity-30 px-4 py-2 rounded-[35px] shadow-sm opacity-0 transition-all duration-500 ease-in-out animate-fade-in`}
                >
                  {message.text}
                </div>
              </div>
            ))
          ) : (
            <div className={`flex`}>
              <div
                className={`text-white bg-purple-100 bg-opacity-30 px-4 py-2 rounded-[35px] shadow-sm opacity-0 transition-all duration-500 ease-in-out animate-fade-in`}
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
