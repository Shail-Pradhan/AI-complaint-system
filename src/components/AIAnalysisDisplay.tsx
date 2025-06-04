import React, { useEffect, useState } from 'react'
import {
  Box,
  Text,
  VStack,
  Badge,
  useColorModeValue,
  Flex,
  Icon,
  ScaleFade,
  SlideFade,
  Divider,
  Heading,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaRobot, FaCheckCircle } from 'react-icons/fa'
import { BsLightningChargeFill } from 'react-icons/bs'

const MotionBox = motion.create(Box)
const MotionText = motion.create(Text)
const MotionFlex = motion.create(Flex)

interface AIAnalysisDisplayProps {
  analysis: {
    department_id: string
    category_prediction: string
    priority_score: number
    analysis_text: string
    officer_recommendation: string
    version: string
  }
}

const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({ analysis }) => {
  const [showContent, setShowContent] = useState(false)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  useEffect(() => {
    setShowContent(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  }

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <ScaleFade in={showContent} initialScale={0.9}>
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        bg={bgColor}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        p={6}
        boxShadow="lg"
        maxW="800px"
        mx="auto"
      >
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <MotionFlex variants={itemVariants} align="center" justify="space-between">
            <Flex align="center" gap={3}>
              <Icon as={FaRobot} w={6} h={6} color={accentColor} />
              <Heading size="md" color={textColor}>
                AI Analysis Results
              </Heading>
            </Flex>
            <Badge colorScheme="blue" fontSize="sm" p={2}>
              {analysis.version}
            </Badge>
          </MotionFlex>

          <Divider />

          {/* Department and Category */}
          <MotionFlex variants={itemVariants} justify="space-between" align="center" wrap="wrap" gap={4}>
            <Flex align="center" gap={2}>
              <Text fontWeight="semibold">Department:</Text>
              <Badge colorScheme="purple" fontSize="md" p={2}>
                {analysis.department_id}
              </Badge>
            </Flex>
            <Flex align="center" gap={2}>
              <Text fontWeight="semibold">Category:</Text>
              <Badge colorScheme="teal" fontSize="md" p={2}>
                {analysis.category_prediction}
              </Badge>
            </Flex>
          </MotionFlex>

          {/* Priority Score */}
          <MotionBox variants={itemVariants}>
            <Flex align="center" gap={2}>
              <Text fontWeight="semibold">Priority Score:</Text>
              <Badge
                colorScheme={analysis.priority_score >= 0.7 ? 'red' : analysis.priority_score >= 0.4 ? 'yellow' : 'green'}
                fontSize="md"
                p={2}
              >
                {Math.round(analysis.priority_score * 10)}/10
              </Badge>
            </Flex>
          </MotionBox>

          {/* Analysis */}
          <MotionBox
            variants={itemVariants}
            p={4}
            bg={useColorModeValue('blue.50', 'blue.900')}
            borderRadius="md"
            borderWidth="1px"
            borderColor={useColorModeValue('blue.200', 'blue.700')}
          >
            <VStack align="stretch" spacing={3}>
              <Flex align="center" gap={2}>
                <Icon as={BsLightningChargeFill} color="blue.500" />
                <Text fontWeight="bold" color={useColorModeValue('blue.700', 'blue.300')}>
                  Analysis
                </Text>
              </Flex>
              <MotionText
                variants={textVariants}
                color={useColorModeValue('blue.800', 'blue.100')}
                whiteSpace="pre-wrap"
              >
                {analysis.analysis_text}
              </MotionText>
            </VStack>
          </MotionBox>

          {/* Officer Recommendation */}
          <MotionBox
            variants={itemVariants}
            p={4}
            bg={useColorModeValue('green.50', 'green.900')}
            borderRadius="md"
            borderWidth="1px"
            borderColor={useColorModeValue('green.200', 'green.700')}
          >
            <VStack align="stretch" spacing={3}>
              <Flex align="center" gap={2}>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text fontWeight="bold" color={useColorModeValue('green.700', 'green.300')}>
                  Officer Recommendation
                </Text>
              </Flex>
              <MotionText
                variants={textVariants}
                color={useColorModeValue('green.800', 'green.100')}
                whiteSpace="pre-wrap"
              >
                {analysis.officer_recommendation}
              </MotionText>
            </VStack>
          </MotionBox>
        </VStack>
      </MotionBox>
    </ScaleFade>
  )
}

export default AIAnalysisDisplay 