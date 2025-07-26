import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Param,
  Delete,
  Get
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('File Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('exhibition/:id/header-logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload exhibition header logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Exhibition header logo file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Header logo uploaded successfully' })
  async uploadHeaderLogo(
    @Param('id') exhibitionId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const filePath = await this.uploadService.uploadHeaderLogo(file, exhibitionId);
    
    return {
      success: true,
      message: 'Header logo uploaded successfully',
      data: {
        filePath,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    };
  }

  @Post('exhibition/:id/sponsor-logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload exhibition sponsor logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Exhibition sponsor logo file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        index: {
          type: 'number',
          description: 'Index of the sponsor logo'
        }
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Sponsor logo uploaded successfully' })
  async uploadSponsorLogo(
    @Param('id') exhibitionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('index') index: string = '0'
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const logoIndex = parseInt(index, 10) || 0;
    const filePath = await this.uploadService.uploadSponsorLogo(file, exhibitionId, logoIndex);
    
    return {
      success: true,
      message: 'Sponsor logo uploaded successfully',
      data: {
        filePath,
        index: logoIndex,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    };
  }

  @Post('exhibition/:id/footer-logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload exhibition footer logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Exhibition footer logo file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Footer logo uploaded successfully' })
  async uploadFooterLogo(
    @Param('id') exhibitionId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const filePath = await this.uploadService.uploadFooterLogo(file, exhibitionId);
    
    return {
      success: true,
      message: 'Footer logo uploaded successfully',
      data: {
        filePath,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    };
  }

  @Post('user/:id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User avatar file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  async uploadUserAvatar(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const filePath = await this.uploadService.uploadUserAvatar(file, userId);
    
    return {
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filePath,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    };
  }

  @Post('exhibitor/:id/logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload exhibitor logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Exhibitor logo file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Exhibitor logo uploaded successfully' })
  async uploadExhibitorLogo(
    @Param('id') exhibitorId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const filePath = await this.uploadService.uploadExhibitorLogo(file, exhibitorId);
    
    return {
      success: true,
      message: 'Exhibitor logo uploaded successfully',
      data: {
        filePath,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    };
  }

  @Post('system/header-logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload system header logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'System header logo file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'System header logo uploaded successfully' })
  async uploadSystemHeaderLogo(
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const filePath = await this.uploadService.uploadSystemHeaderLogo(file);
    
    return {
      success: true,
      message: 'System header logo uploaded successfully',
      data: {
        filePath,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    };
  }

  @Delete('file')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Body('filePath') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('File path is required');
    }

    await this.uploadService.deleteFile(filePath);
    
    return {
      success: true,
      message: 'File deleted successfully'
    };
  }

  @Get('file-info')
  @ApiOperation({ summary: 'Get file information' })
  @ApiResponse({ status: 200, description: 'File information retrieved successfully' })
  async getFileInfo(@Body('filePath') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('File path is required');
    }

    const fileInfo = await this.uploadService.getFileInfo(filePath);
    
    return {
      success: true,
      data: fileInfo
    };
  }

  @Post('convert-base64')
  @ApiOperation({ summary: 'Convert base64 image to file (migration helper)' })
  @ApiResponse({ status: 201, description: 'Base64 image converted successfully' })
  async convertBase64ToFile(@Body() body: {
    base64Data: string;
    type: 'header' | 'sponsor' | 'footer' | 'avatar' | 'logo';
    entityId: string;
    index?: number;
  }) {
    const { base64Data, type, entityId, index = 0 } = body;

    if (!base64Data || !type || !entityId) {
      throw new BadRequestException('base64Data, type, and entityId are required');
    }

    let filePath: string;

    switch (type) {
      case 'header':
        filePath = await this.uploadService.convertBase64ToFile(
          base64Data,
          'images/exhibitions/headers',
          `${entityId}-header`,
          { width: 400, height: 160, quality: 90 }
        );
        break;
      case 'sponsor':
        filePath = await this.uploadService.convertBase64ToFile(
          base64Data,
          'images/exhibitions/sponsors',
          `${entityId}-sponsor-${index}`,
          { width: 300, height: 120, quality: 85 }
        );
        break;
      case 'footer':
        filePath = await this.uploadService.convertBase64ToFile(
          base64Data,
          'images/exhibitions/footers',
          `${entityId}-footer`,
          { width: 300, height: 100, quality: 85 }
        );
        break;
      case 'avatar':
        filePath = await this.uploadService.convertBase64ToFile(
          base64Data,
          'images/users/avatars',
          `${entityId}-avatar`,
          { width: 200, height: 200, quality: 80 }
        );
        break;
      case 'logo':
        filePath = await this.uploadService.convertBase64ToFile(
          base64Data,
          'images/exhibitors/logos',
          `${entityId}-logo`,
          { width: 250, height: 250, quality: 85 }
        );
        break;
      default:
        throw new BadRequestException('Invalid type');
    }

    return {
      success: true,
      message: 'Base64 image converted successfully',
      data: { filePath }
    };
  }
} 