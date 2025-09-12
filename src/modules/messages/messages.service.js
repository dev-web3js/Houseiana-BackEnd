import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class MessagesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Get user conversations
  async getConversations(userId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { participantOneId: userId },
          { participantTwoId: userId },
        ],
      },
      include: {
        ParticipantOne: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        ParticipantTwo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        Messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
        _count: {
          select: {
            Messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      skip,
      take: parseInt(limit),
      orderBy: { updatedAt: 'desc' },
    });

    // Format conversations for mobile app
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.ParticipantOne.id === userId 
        ? conv.ParticipantTwo 
        : conv.ParticipantOne;

      return {
        id: conv.id,
        participant: {
          id: otherParticipant.id,
          name: `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim(),
          profileImage: otherParticipant.profileImage,
        },
        lastMessage: conv.Messages[0] || null,
        unreadCount: conv._count.Messages,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
      };
    });

    return {
      success: true,
      message: 'Conversations retrieved successfully',
      data: formattedConversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: conversations.length === parseInt(limit),
      },
    };
  }

  // Get messages in a conversation
  async getMessages(conversationId, userId, query = {}) {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    // Verify user is part of the conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participantOneId: userId },
          { participantTwoId: userId },
        ],
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        Sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    // Mark messages as read for the current user
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    return {
      success: true,
      message: 'Messages retrieved successfully',
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit),
      },
    };
  }

  // Send a message
  async sendMessage(conversationId, senderId, content, messageType = 'text') {
    // Verify user is part of the conversation
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participantOneId: senderId },
          { participantTwoId: senderId },
        ],
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        messageType,
        isRead: false,
        createdAt: new Date(),
      },
      include: {
        Sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    // Update conversation's last activity
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      success: true,
      message: 'Message sent successfully',
      data: message,
    };
  }

  // Create a new conversation
  async createConversation(participantOneId, participantTwoId, initialMessage = '') {
    if (participantOneId === participantTwoId) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Check if conversation already exists
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participantOneId: participantOneId,
            participantTwoId: participantTwoId,
          },
          {
            participantOneId: participantTwoId,
            participantTwoId: participantOneId,
          },
        ],
      },
    });

    if (existingConversation) {
      // If initial message provided, send it
      if (initialMessage) {
        await this.sendMessage(existingConversation.id, participantOneId, initialMessage);
      }
      
      return {
        success: true,
        message: 'Conversation already exists',
        conversationId: existingConversation.id,
        isNew: false,
      };
    }

    // Verify both users exist
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: [participantOneId, participantTwoId] },
      },
      select: { id: true },
    });

    if (users.length !== 2) {
      throw new NotFoundException('One or both users not found');
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        participantOneId,
        participantTwoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send initial message if provided
    if (initialMessage) {
      await this.sendMessage(conversation.id, participantOneId, initialMessage);
    }

    return {
      success: true,
      message: 'Conversation created successfully',
      conversationId: conversation.id,
      isNew: true,
    };
  }

  // Delete a message
  async deleteMessage(messageId, userId) {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found or access denied');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    return {
      success: true,
      message: 'Message deleted successfully',
    };
  }

  // Get conversation by participants
  async getConversationByParticipants(participantOneId, participantTwoId) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participantOneId: participantOneId,
            participantTwoId: participantTwoId,
          },
          {
            participantOneId: participantTwoId,
            participantTwoId: participantOneId,
          },
        ],
      },
      include: {
        ParticipantOne: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        ParticipantTwo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    if (!conversation) {
      return {
        success: false,
        message: 'Conversation not found',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Conversation found',
      data: conversation,
    };
  }
}