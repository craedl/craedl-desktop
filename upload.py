#!/usr/bin/env python3
import craedl

profile = craedl.auth()
research_group = profile.get_research_group('craedl')
project = research_group.get_project('Craedl Desktop Application')
home = project.get_data()
home = home.upload_directory('./packages', output=True)