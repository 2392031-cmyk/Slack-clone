import { useParams } from 'react-router-dom'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'

export default function ChannelPage() {
  const { channelId = 'general' } = useParams()
  const scopePath = `channels/${channelId}/messages`

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 font-semibold"># {channelId}</header>
      <MessageList scopePath={scopePath} />
      <MessageInput scopePath={scopePath} />
    </div>
  )
}
