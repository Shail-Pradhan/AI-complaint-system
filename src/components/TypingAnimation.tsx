import React, { useState, useEffect } from 'react'
import { Box, Text, Flex, Icon, useColorModeValue } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { FaRobot } from 'react-icons/fa'

interface TypingAnimationProps {
  text: string
  onComplete: () => void
  speed?: number
}

const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`

const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  text, 
  onComplete,
  speed = 30
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const borderColor = useColorModeValue('blue.100', 'blue.700')
  const bgGradient = useColorModeValue(
    'linear(to-br, white, blue.50)',
    'linear(to-br, gray.800, blue.900)'
  )
  const headerBg = useColorModeValue('blue.50', 'blue.800')
  const textColor = useColorModeValue('gray.700', 'gray.100')

  useEffect(() => {
    let currentIndex = 0
    const intervalTime = 1000 / speed

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex])
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setIsComplete(true)
        onComplete()
      }
    }, intervalTime)

    return () => clearInterval(typingInterval)
  }, [text, speed, onComplete])

  return (
    <Box 
      position="relative" 
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      bgGradient={bgGradient}
    >
      {/* Header */}
      <Box
        bg={headerBg}
        p={4}
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Flex align="center">
          <Icon 
            as={FaRobot} 
            color="blue.500" 
            boxSize={5} 
            mr={2}
          />
          <Text 
            fontWeight="semibold" 
            fontSize="lg" 
            bgGradient="linear(to-r, blue.500, blue.600)"
            bgClip="text"
          >
            AI Analysis
          </Text>
        </Flex>
      </Box>

      {/* Content */}
      <Box p={6}>
        <Text
          fontSize="md"
          lineHeight="1.8"
          color={textColor}
          whiteSpace="pre-wrap"
          sx={{
            '& strong': {
              color: useColorModeValue('blue.600', 'blue.300'),
              fontWeight: 'semibold'
            }
          }}
        >
          {displayedText}
          {!isComplete && (
            <Box
              as="span"
              h="1.2em"
              w="2px"
              bg="blue.400"
              display="inline-block"
              verticalAlign="middle"
              ml={1}
              animation={`${blinkAnimation} 1s infinite`}
              boxShadow="0 0 8px rgba(66, 153, 225, 0.6)"
            />
          )}
        </Text>
      </Box>
    </Box>
  )
}

export default TypingAnimation 