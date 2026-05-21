import Image from 'next/image'

export default function AssistantAvatar() {
  return (
    <figure className="w-12 aspect-square">
      <Image
        className="w-full h-full object-cover"
        src="/sample-avatar.png"
        alt="JurneeGo Assistant"
        width={40}
        height={40}
      />
    </figure>
  )
}
