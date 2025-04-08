import { FloatingPortal, Placement, arrow, offset, shift, useFloating } from '@floating-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ElementType, useId, useRef } from 'react'

interface Props {
  children?: React.ReactNode
  renderPopover: React.ReactNode
  className?: string
  //  as được dùng trong trường hợp mà người đùng muốn sử dụng thẻ kháC ngoài thẻ div
  as?: ElementType
  initalOpen: boolean
  placement?: Placement
}

export default function Popover({ children, className, renderPopover, as: Element = 'div', initalOpen, placement = 'top' }: Props) {
  const id = useId()
  const arrowRef = useRef<HTMLElement>(null)

  const { x, y, refs, floatingStyles, strategy, middlewareData } = useFloating({
    middleware: [offset(6), shift(), arrow({ element: arrowRef })],
    placement: placement
  })

  // //  dùng để show đối tượng
  // const showPopover = () => {
  //   setIsOpen(true)
  // }

  // const hidePopover = () => {
  //   setIsOpen(false)
  // }
  return (
    <Element className={className} ref={refs.setReference}>
      {children}
      {/*  thằng này bắt buộc phải bao bộc bằng thằng Portal */}
      <FloatingPortal id={id}>
        <AnimatePresence>
          {initalOpen && (
            <motion.div
              ref={refs.setFloating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                width: 'max-content',
                ...floatingStyles,
                transformOrigin: `${middlewareData.arrow?.x}px-top`
              }}
            >
              {renderPopover}
              {/* thẻ ngôi sao */}
              {/* Mũi tên nằm bên dưới */}
              <span
                ref={arrowRef}
                className='border-x-transparent border-b-transparent border-t-white border-[15px] absolute '
                style={{
                  left: middlewareData.arrow?.x,
                  top: middlewareData.arrow?.y
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </Element>
  )
}
