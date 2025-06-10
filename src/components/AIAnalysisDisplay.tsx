import React from 'react'
import {
  Box,
  Text,
  Stack,
  Badge,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react'

interface AIAnalysisDisplayProps {
  analysis: {
    priority_score: number
    analysis_text: string
    image_analysis?: {
      objects_detected: string[]
      scene_description: string
      severity_score: number
    }
  }
}

const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({ analysis }) => {
  return (
    <Stack spacing={4}>
      <Box borderTop="1px" borderColor="gray.200" pt={4}>
        <Text fontWeight="bold" fontSize="lg" mb={2}>
          AI Analysis
        </Text>
        
        <Box bg="gray.50" p={4} borderRadius="md">
          <Stack spacing={4}>
            <Box>
              <Text fontWeight="semibold">Department</Text>
              <Badge colorScheme="blue" fontSize="sm">
                {analysis.analysis_text.split('\n').find(line => 
                  line.startsWith('Department:'))?.split(':')[1]?.trim() || 'Not specified'}
              </Badge>
            </Box>

            <Box>
              <Text fontWeight="semibold">Priority Score</Text>
              <Badge
                colorScheme={
                  analysis.priority_score >= 0.7
                    ? 'red'
                    : analysis.priority_score >= 0.4
                    ? 'yellow'
                    : 'green'
                }
              >
                {Math.round(analysis.priority_score * 10)}/10
              </Badge>
            </Box>

            <Box>
              <Text fontWeight="semibold">Analysis</Text>
              <Text>
                {analysis.analysis_text.split('\n').find(line => 
                  line.startsWith('Analysis:'))?.split(':')[1]?.trim() || 'No analysis available'}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="semibold">Officer Recommendation</Text>
              <Text>
                {analysis.analysis_text.split('\n').find(line => 
                  line.startsWith('Officer:'))?.split(':')[1]?.trim() || 'No recommendation available'}
              </Text>
            </Box>

            {analysis.image_analysis && (
              <Box>
                <Text fontWeight="semibold">Image Analysis</Text>
                <Text>
                  {analysis.image_analysis.scene_description}
                </Text>
                {analysis.image_analysis.objects_detected.length > 0 && (
                  <Box mt={2}>
                    <Text fontWeight="semibold" fontSize="sm">
                      Objects Detected:
                    </Text>
                    <HStack spacing={2} mt={1} flexWrap="wrap">
                      {analysis.image_analysis.objects_detected.map(
                        (object, index) => (
                          <Badge key={index} colorScheme="blue">
                            {object}
                          </Badge>
                        )
                      )}
                    </HStack>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </Stack>
  )
}

export default AIAnalysisDisplay 