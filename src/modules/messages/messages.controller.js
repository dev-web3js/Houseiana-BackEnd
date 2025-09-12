import { Controller, Get, Post, Body, Patch, Param, Query, Delete, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@Controller('api/messages')
export class MessagesController {
  constructor(messagesService) {
    this.messagesService = messagesService;
  }

  // Get user conversations
  @Get('conversations')
  @UseGuards(JwtStrategy)
  async getConversations(@Request() req, @Query() query) {
    return this.messagesService.getConversations(req.user.id, query);
  }

  // Get messages in a conversation
  @Get('conversations/:id')
  @UseGuards(JwtStrategy)
  async getMessages(@Param('id') conversationId, @Request() req, @Query() query) {
    return this.messagesService.getMessages(conversationId, req.user.id, query);
  }

  // Send a message
  @Post('conversations/:id')
  @UseGuards(JwtStrategy)
  async sendMessage(@Param('id') conversationId, @Request() req, @Body() body) {
    const { content, messageType } = body;
    return this.messagesService.sendMessage(conversationId, req.user.id, content, messageType);
  }

  // Create a new conversation
  @Post('conversations')
  @UseGuards(JwtStrategy)
  async createConversation(@Request() req, @Body() body) {
    const { participantTwoId, initialMessage } = body;
    return this.messagesService.createConversation(req.user.id, participantTwoId, initialMessage);
  }

  // Delete a message
  @Delete('messages/:id')
  @UseGuards(JwtStrategy)
  async deleteMessage(@Param('id') messageId, @Request() req) {
    return this.messagesService.deleteMessage(messageId, req.user.id);
  }

  // Get conversation by participants (for checking if conversation exists)
  @Get('conversations/check/:participantId')
  @UseGuards(JwtStrategy)
  async getConversationByParticipants(@Param('participantId') participantId, @Request() req) {
    return this.messagesService.getConversationByParticipants(req.user.id, participantId);
  }
}