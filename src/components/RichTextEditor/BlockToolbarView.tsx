// import React from 'react'
// import { Button } from '../../ui/button'
// import { Textarea } from '../../ui/textarea'

import Button from '../button'

type BlockToolbarViewProps = {
  offsetY: number
  onLLMImprove: (prompt?: string) => void
}

function BlockToolbarView(props: BlockToolbarViewProps) {
  const { offsetY, onLLMImprove } = props
  return (
    <div
      className="absolute top-5 rounded-lg flex gap-1 transition-all duration-75"
      style={{
        left: -96,
        visibility: offsetY > 0 ? 'visible' : 'hidden',
        transform: `translateY(${offsetY}px)`,
      }}
    >
      <Button
        size="sm"
        variant="ghost"
        className="hover:bg-slate-700 hover:bg-opacity-90 p-2"
        onClick={() => onLLMImprove()}
      >
        {/* <RiSparkling2Fill className="w-4 h-4" /> */}
      </Button>

      {/* <Dialog open={visible} onOpenChange={setVisible}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="hover:bg-slate-700 hover:bg-opacity-90"
            onClick={() => setVisible(true)}
          >
            <RiFileEditLine className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[425px] bg-black"
          onSubmit={() => onLLMImprove()}
        >
          <DialogHeader>
            <DialogTitle>自定义指令</DialogTitle>
            <DialogDescription>
              这里可以输入自定义指令来优化文章内容
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"></div>
            <Textarea
              placeholder="Type your message here."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <div className="grid grid-cols-4 items-center gap-4"></div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                onLLMImprove(customPrompt)
                setVisible(false)
              }}
            >
              改进
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}

export default BlockToolbarView
