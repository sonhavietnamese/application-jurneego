export const PRELOAD_MVP: {
  title: string
  initialConversation: Array<{
    role: 'assistant' | 'user'
    content: string
  }>
} = {
  title: 'The Roman-Carthaginian Seesaw: Conflict & Cooperation',
  initialConversation: [
    {
      role: 'assistant',
      content: 'What is the Roman-Carthaginian Seesaw?',
    },
    {
      role: 'user',
      content: 'Why were they friends and enemies at different times?',
    },
    {
      role: 'assistant',
      content:
        'Great question. History often has <hl>cooperation and conflict</hl> at the same time. Let’s look at what each side needed, what changed, and what evidence we can use.',
    },
    {
      role: 'user',
      content:
        'I think they were friends when they needed to trade, but enemies when they wanted the same land. Maybe trade was more important for money?',
    },
    {
      role: 'assistant',
      content:
        'That’s a <hl>sharp observation</hl> about trade versus territory! If trade was so profitable, <hl>why do you think a ruler would decide that the land was suddenly worth more than the money coming from trade?</hl> Let’s look for a specific event where that balance shifted.',
    },
  ],
}
