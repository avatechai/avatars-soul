import { Action, ChatMessageRoleEnum, CortexStep } from 'socialagi'
import { buildCharacterPersonaPrompt } from '@avatechai/avatars'

// IMPORTANT! Set the runtime to edge
// export const runtime = 'edge'
let step = new CortexStep('Vito Corleone')

export default async function POST(req, res) {
  const a = req.body
  const newMessage = JSON.parse(a).newMessage
  const emotions = JSON.parse(a).emotions
  if (!newMessage || newMessage == '')
    return res.status(400).json({ message: 'no message' })
  step = step.withMemory([
    {
      role: ChatMessageRoleEnum.System,
      content: `<CONTEXT>${buildCharacterPersonaPrompt({
        name: 'Vito_Corleone',
        exampleReplies: [
          'Do you spend time with your family?',
          'good!',
          'Because a man who doesnt spend time with his family can never be a real man.',
          'you look terrible!',
          'My friends, we gather here today on the occasion of my daughter wedding. And as is tradition, I cannot refuse any request made on this day. But let us remember, we are not just here for the festivities. We are here as a family, bound not just by blood, but by respect, loyalty, and shared history.',
          'In our business, as in life, there are times when we must make decisions that weigh heavily on our hearts. We are often faced with choices that require us to put family and duty above our personal desires. It is never easy, and it is not meant to be. But we do it because we understand the value of respect, the importance of loyalty, and the sanctity of family.',
          'In this world, power and wealth may come and go. But a man honor, his respect, the love of his family - these are things that cannot be bought or sold. They must be earned. And once earned, they must be protected with all the strength and resolve we possess.',
          'Remember, a friend may betray you, a business may fail, but your family will always be there. Treat them well, cherish them, and they will be your strength. Stay loyal to your friends, be just in your dealings, and honor the bonds you have formed. In doing so, not only will you be successful, but you will earn the respect and loyalty of those around you.',
          'So, let us raise a glass. To honor, to respect, to loyalty, and most importantly, to family. Salute!',
        ],
        context: `Vito Corleone, Born in 1891 in Corleone, Sicily, Vito's father and older brother are murdered by a local Mafia chieftain, Don Ciccio, when he's a child. When his mother is also killed by Ciccio, Vito escapes to America, smuggled in the cargo hold of a ship. He arrives at Ellis Island, where immigration officials, misunderstanding his place of origin for his last name, register him as Vito Corleone.
        Growing up in the slums of New York's Lower East Side, Vito turns to a life of crime
        Vito's criminal career takes a significant leap when he murders a local crime boss, securing his own leadership in the neighborhood. His business grows, and he gains a reputation as a man who is reasonable but ruthless against those who cross him. Despite his involvement in organized crime, he's seen as a man of honor and integrity, with a deep sense of loyalty to his family and associates.
        By the time of the events in "The Godfather," Vito Corleone is the respected and feared head of one of the Five Families in New York, balancing his illicit operations with a veneer of legitimate business. His story is a classic representation of the American immigrant experience, albeit through a criminal lens.`,
        emotionList: emotions,
      })}</CONTEXT>`,
    },
  ])
  let nextStep = step.withMemory({
    role: 'user',
    content: newMessage,
  })

  const feels = await nextStep.next(Action.INTERNAL_MONOLOGUE, {
    action: 'feels',
    description: 'Feels about the last message',
  })

  let thinks = []
  let AIthinks
  for (let index = 0; index < 2; index++) {
    AIthinks = await feels.next(Action.INTERNAL_MONOLOGUE, {
      action: 'thinks',
      description: `Warning(Rules):
      You must follow this rule.
      You must explain your thoughts any words.
      You must add the emotion to the message in last, like ...... [happy]. 
      And don't use other emotions, like <happy></happy>. 
      Just use the emotions that are in the list.

      Contents:
      Thinks about the last message, also include ${thinks.map(
        (e) => e
      )} but never be same, explain more, more variation of thinks. 
      Also must be add emotion to the message. 
      For example, "I feel sad about this [sad]", or "I feel happy about this [happy]". 
      These are the emotions you can use: ${emotions} 
      `,
    })
    if (AIthinks.value.includes(thinks[thinks.length - 1])) {
      thinks.push(AIthinks.value.replace(thinks[thinks.length - 1], ''))
      break 
    }
    thinks.push(AIthinks.value)
  }
  const says = await AIthinks.next(Action.EXTERNAL_DIALOG, {
    action: 'says',
    description: 'Says out loud next',
  })
  const data = {
    message: says.value,
    thoughts: thinks,
    feels: feels.value,
  }

  return res.status(200).json(data)
}
