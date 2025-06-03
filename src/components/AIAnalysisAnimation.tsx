import React, { useEffect, useState } from 'react'
import {
  Box,
  Text,
  useColorModeValue,
  Avatar,
  Flex,
  Badge,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

interface AIAnalysisAnimationProps {
  complaintId: string
  onComplete?: () => void
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px) }
  to { opacity: 1; transform: translateY(0) }
`

const AIAnalysisAnimation: React.FC<AIAnalysisAnimationProps> = ({ complaintId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const bgColor = useColorModeValue('white', 'gray.800')
  const bubbleBg = useColorModeValue('blue.50', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')

  const steps = [
    {
      text: "I'm analyzing your complaint...",
      delay: 1000,
      isSystem: false
    },
    {
      text: "I've identified the key details and am determining the best department to handle this...",
      delay: 2000,
      isSystem: false
    },
    {
      text: `Analysis Complete! Here's what I found:

📋 Department: Health & Sanitation
🏷️ Category: Sanitation Issue
⚠️ Priority: High (80%)

📝 Analysis:
The complaint involves a sewage leak in the pipe, which poses significant health and environmental risks. This requires immediate attention to prevent contamination and health hazards.

👨‍💼 Recommended Handler:
An environmental health officer or sanitation engineer should handle this case. They have the expertise to:
• Assess the situation thoroughly
• Identify the root cause
• Implement proper repairs
• Ensure compliance with health regulations

🤖 Analysis performed using llama-3.3-70b-versatile`,
      delay: 3000,
      isSystem: false
    }
  ]

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, steps[currentStep].delay)

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentStep, steps.length, onComplete])

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      overflow="hidden"
      minH="400px"
    >
      <Box 
        bg="blue.500" 
        p={4}
        color="white"
      >
        <HStack spacing={3}>
          <Avatar 
            size="sm" 
            name="AI Assistant" 
            src="/ai-avatar.png" 
            bg="white"
            color="blue.500"
          />
          <Text fontWeight="bold">AI Analysis Assistant</Text>
        </HStack>
      </Box>

      <VStack 
        align="stretch" 
        spacing={4} 
        p={4} 
        maxH="500px" 
        overflowY="auto"
        sx={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'blue.200',
            borderRadius: '24px',
          },
        }}
      >
        {steps.slice(0, currentStep).map((step, index) => (
          <Flex
            key={index}
            justify={step.isSystem ? 'center' : 'flex-start'}
            w="100%"
            animation={`${fadeIn} 0.5s ease-out`}
          >
            {!step.isSystem && (
              <HStack align="start" spacing={3} maxW="80%">
                <Avatar 
                  size="sm" 
                  name="AI Assistant" 
                  src="/ai-avatar.png"
                  bg="blue.500"
                />
                <Box
                  bg={bubbleBg}
                  p={3}
                  borderRadius="lg"
                  borderTopLeftRadius="0"
                  whiteSpace="pre-wrap"
                >
                  <Text color={textColor} fontSize="sm">
                    {step.text}
                  </Text>
                </Box>
              </HStack>
            )}
            {step.isSystem && (
              <Text
                fontSize="xs"
                color="gray.500"
                textAlign="center"
              >
                {step.text}
              </Text>
            )}
          </Flex>
        ))}
      </VStack>
    </Box>
  )
}

export default AIAnalysisAnimation 