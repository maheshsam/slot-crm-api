import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { serialize } from 'class-transformer';
import { Settings } from '../../entity/Settings';
import { CreateSettingsDto } from './dtos/create-settings.dto';
import { UpdateSettingsDto } from './dtos/update-settings.dto';

@Injectable()
export class MasterDataService {
	constructor(
		@InjectRepository(Settings) private repoSettings: Repository<Settings>,
	){}

	getSettings(id?: string, qry?: string): Promise<Settings[]> {
		if(id){
			return this.repoSettings.find({where: { id: parseInt(id)} });
		}
		if(qry && qry != null){
			return this.repoSettings.find({where: { settings_key: Like(`%${qry}%`)} });
		}

		return this.repoSettings.find();
	}

	createSettings(body:CreateSettingsDto) {
		const settings = this.repoSettings.create(body);
		return this.repoSettings.save(settings);
	}

	async updateSettings(settingsId: number, body:UpdateSettingsDto) {
		const settings = await this.repoSettings.findOne({ where: {id: settingsId}});
		if(!settings){
			throw new NotFoundException;
		}
		if(body.settings_key && body.settings_key != null){
			settings.settings_key = body.settings_key;
		}
		if(body.settings_value && body.settings_value != null){
			settings.settings_value = body.settings_value;
		}
		return this.repoSettings.save(settings);
	}

	async deleteSettings(settingsId: number) {
		const settings = await this.repoSettings.findOne({ where: {id: settingsId}});
		if(!settings){
			throw new NotFoundException('Settings not found');
		}
		return this.repoSettings.delete(settings);
	}
	
}