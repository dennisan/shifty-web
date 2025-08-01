import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const Help = () => {
  const [markdownContent, setMarkdownContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [toc, setToc] = useState([])

  useEffect(() => {
    fetch('/help.md')
      .then(response => response.text())
      .then(content => {
        setMarkdownContent(content)
        
        // Generate TOC from markdown content
        const lines = content.split('\n')
        const tocItems = []
        
        lines.forEach((line, index) => {
          if (line.startsWith('## ')) {
            const title = line.replace('## ', '').trim()
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            tocItems.push({
              title,
              id,
              level: 2,
              lineNumber: index
            })
          } else if (line.startsWith('### ')) {
            const title = line.replace('### ', '').trim()
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            tocItems.push({
              title,
              id,
              level: 3,
              lineNumber: index
            })
          }
        })
        
        setToc(tocItems)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading help content:', error)
        setLoading(false)
      })
  }, [])

  const markdownComponents = {
    img: ({ src, alt }) => (
      <div style={{ marginTop: '20px', textAlign: 'left' }}>
        <img 
          src={src} 
          alt={alt}
          style={{ 
            maxWidth: '375px', 
            width: '100%',
            height: 'auto', 
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        />
      </div>
    ),
    h2: ({ children }) => {
      const id = children.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return (
        <h2 
          id={id}
          style={{ 
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            borderBottom: '2px solid #667eea',
            paddingBottom: '10px',
            marginTop: '40px',
            scrollMarginTop: '100px'
          }}
        >
          {children}
        </h2>
      )
    },
    h3: ({ children }) => {
      const id = children.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return (
        <h3 
          id={id}
          style={{ 
            color: '#34495e',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            marginTop: '25px',
            scrollMarginTop: '100px'
          }}
        >
          {children}
        </h3>
      )
    },
    em: ({ children }) => (
      <span style={{ fontStyle: 'italic', color: '#666', fontSize: '14px' }}>
        {children}
      </span>
    ),
    strong: ({ children }) => (
      <strong style={{ color: '#2c3e50' }}>
        {children}
      </strong>
    ),
    h1: ({ children }) => (
      <h1 style={{ 
        color: '#2c3e50', 
        fontSize: '32px', 
        fontWeight: '700', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        {children}
      </h1>
    ),
    
    p: ({ children }) => (
      <p style={{ 
        color: '#555',
        lineHeight: '1.6',
        marginBottom: '15px'
      }}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul style={{ 
        marginLeft: '20px',
        marginBottom: '15px'
      }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ 
        marginLeft: '20px',
        marginBottom: '15px'
      }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ 
        marginBottom: '8px',
        color: '#555'
      }}>
        {children}
      </li>
    )
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#666'
      }}>
        Loading help content...
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
        <h1 style={{ 
          color: '#2c3e50', 
          fontSize: '32px', 
          fontWeight: '700', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Help and Documentation
        </h1>

        {/* Table of Contents */}
        {toc.length > 0 && (
          <div style={{
            marginBottom: '40px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e1e5e9'
          }}>
            <h3 style={{
              color: '#2c3e50',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '15px',
              marginTop: '0'
            }}>
              📋 Table of Contents
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0px'
            }}>
              {toc.map((item, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#667eea',
                    fontSize: '14px',
                    fontWeight: item.level === 2 ? '600' : '400',
                    marginLeft: item.level === 3 ? '20px' : '0',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    display: 'block',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e8f2ff'
                    e.target.style.color = '#4a5568'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = '#667eea'
                  }}
                >
                  {item.level === 2 ? '📖' : '📄'} {item.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <ReactMarkdown 
          components={markdownComponents}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default Help 