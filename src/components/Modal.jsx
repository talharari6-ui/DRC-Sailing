'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export function Modal({ isOpen, onClose, title, children }) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="bg-background rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <SheetHeader>
          <SheetTitle className="text-lg sm:text-xl font-extrabold">{title}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}

export default Modal
