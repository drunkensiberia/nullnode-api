import {
    Controller,
    Get,
    Post,
    HttpCode,
    Param,
    Body,
    UsePipes,
    ValidationPipe,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Delete, ParseIntPipe, UploadedFile
} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {ProjectsService} from "./projects.service";
import {AddProjectDto} from "./dto/add-project.dto";
import {UpdateProjectDto} from "./dto/update-project.dto"
import {Project} from '@prisma/client';
import {diskStorage} from "multer";
import editFileName from "../../utils/editFileName";


@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {
    }

    @Get()
    async getProjects(): Promise<Project[]> {
        return this.projectsService.getProjects();
    }

    @Get('getProject/:id')
    async getProject(@Param('id', ParseIntPipe) id): Promise<Project> {
        return this.projectsService.getProject(id);
    }

    @Post('addProject')
    @UseInterceptors(FileInterceptor('logo', {
        storage: diskStorage({
            destination: './public',
            filename: editFileName
        })
    }))
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async addProject(
        @Body() body: AddProjectDto,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                new FileTypeValidator({ fileType: '(jpg|jpeg|png)' }),
            ]
        })) file: Express.Multer.File

    ): Promise<void> {
        body.logo = file.filename;
        body.onGoing = Boolean(body.onGoing);
        await this.projectsService.addProject(body)
    }

    @Post('updateProject')
    @HttpCode(200)
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async updateProject(@Body() updateProjectDto: UpdateProjectDto): Promise<void> {
        await this.projectsService.updateProject(updateProjectDto)
    }

    @Delete('deleteProject/:id')
    async deleteProject(@Param('id', ParseIntPipe) id): Promise<void> {
        await this.projectsService.deleteProject(+id)
    }
}