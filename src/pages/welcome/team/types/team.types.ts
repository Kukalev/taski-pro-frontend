export type TeamSize = string
export type Activity = string
export type Role = string

export interface TeamStepOneProps {
	selectedOption: TeamSize
	setSelectedOption: (option: TeamSize) => void
}

export interface TeamStepTwoProps {
	selectedActivity: Activity
	setSelectedActivity: (activity: Activity) => void
	activities: string[]
}

export interface TeamStepThreeProps {
	selectedRole: Role
	setSelectedRole: (role: Role) => void
	roles: string[]
}

export interface ProgressBarProps {
	step: number
}

export interface TeamData {
	teamSize: TeamSize
	activity: Activity
	role: Role
}
