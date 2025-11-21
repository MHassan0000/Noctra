"use client"
import React, { useState } from "react"
import Link from "next/link"
import { navigationLinks } from "../../../constants/index"
import Image from "next/image"
import { Home, Layers, DollarSign, BookOpen, Image as ImageIcon, Sparkles, Scissors,Eraser, Repeat, Menu, X, Mail } from "lucide-react"
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"

interface NavLink {
  label: string
  href: string
  Icon: React.ComponentType<any>
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Contact", href: "/contact", Icon: Mail },
  { label: "About", href: "/about", Icon: BookOpen },
]

export default function Sidebar() {
  const { user , isSignedIn } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger (top-left) */}
      <button aria-label="Open menu" onClick={() => setIsOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center border border-purple-50 shadow-sm">
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile slide-over drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex text-black">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative w-64 max-w-full h-full bg-white/95 backdrop-blur-sm border-r border-purple-50 shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Image src="/images/texture.png" alt="Noctra" width={40} height={40} className="rounded-md" />
              </Link>
              <button aria-label="Close menu" onClick={() => setIsOpen(false)} className="p-2 rounded-md">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <nav className="mt-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-purple-50">
                  <link.Icon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>

            <hr className="my-4" />

            <div className="flex flex-col gap-3">
              {navigationLinks.map((t) => {
                // choose icon by label
                const key = t.label.toLowerCase()
                let IconComp: any = ImageIcon
                if (key.includes("fill")) IconComp = Sparkles
                else if (key.includes("remove background") || key.includes("background")) IconComp = Eraser
                else if (key.includes("remove") || key.includes("object remove")) IconComp = Scissors
                else if (key.includes("recolor")) IconComp = Repeat

                return (
                  <Link key={t.route} href={t.route} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-purple-50">
                    <IconComp className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">{t.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="mt-auto flex flex-col gap-3">
              {isSignedIn ? (
                <div className="w-full flex items-center gap-2">
                  <UserButton appearance={{elements:{userButtonAvatarBox:{width:36,height:36}}}}/>
                  <span className="text-sm font-medium">{user?.firstName + " " + user?.lastName}</span>
                </div>
              ) : (
                <div className="w-full inline-flex items-center gap-2 justify-center bg-linear-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-md text-sm font-semibold"><SignInButton/></div>
              )}

              <Link href="/credits" onClick={() => setIsOpen(false)} className="w-full inline-flex items-center gap-2 justify-center bg-linear-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-md text-sm font-semibold">Get Credits</Link>
            </div>
          </div>
        </div>
      )}
      {/* Desktop left rail */}
      <aside className="hidden lg:flex flex-col items-center gap-4 h-screen overflow-y-auto w-20 p-2 fixed left-0 top-0 bg-white/85 backdrop-blur-sm border-r border-gray-200 rounded-3xl shadow-lg z-40">
        <Link href="/" className="mt-1">
          <Image src="/images/texture.png" alt="Noctra" width={32} height={32} className="rounded-md" />
        </Link>

        {/* Public nav links - always visible on desktop */}
        <div className="flex flex-col items-center gap-3 mt-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} aria-label={link.label} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-purple-50 transition" title={link.label}>
              <link.Icon className="w-4 h-4 text-gray-700" />
            </Link>
          ))}
        </div>

        {/* Tool icons - desktop only visible when signed in */}
        {isSignedIn && (
          <div className="flex flex-col items-center gap-3 mt-3">
            {navigationLinks.map((t) => {
              const key = t.label.toLowerCase()
              
              let IconComp: any = ImageIcon
              if (key.includes("fill")) IconComp = Sparkles
              else if (key.includes("remove background") || key.includes("background")) IconComp = Eraser
              else if (key.includes("remove") || key.includes("object remove")) IconComp = Scissors
              else if (key.includes("recolor")) IconComp = Repeat

              return (
                <Link key={t.route} href={t.route} aria-label={t.label} className="group flex items-center justify-center w-9 h-9 rounded-full bg-purple-50 hover:scale-105 transition">
                  <IconComp className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-auto mb-5 ">
          {isSignedIn ? (
            <div className="flex flex-col items-center gap-5 w-full">
            <div className="w-full flex items-center justify-center">
              <UserButton appearance={{elements:{userButtonAvatarBox:{width:34,height:34}}}}/>
            </div>
            <div className="w-full flex items-center justify-center">
            <Link href="/credits" aria-label="Get Credits" className="w-9 h-9 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-md hover:scale-105 transition">
              <DollarSign className="w-4 h-4" />
            </Link>
          </div>
            </div>
            
          ) : (
            <div  className="text-xs font-bold rounded-xl shadow-md hover:scale-105 transition bg-linear-to-r from-indigo-500 to-purple-500 text-white text-center px-2 py-2"><SignInButton/></div>
          )}

          
        </div>
      </aside>

    
      
    </>
  )
}

