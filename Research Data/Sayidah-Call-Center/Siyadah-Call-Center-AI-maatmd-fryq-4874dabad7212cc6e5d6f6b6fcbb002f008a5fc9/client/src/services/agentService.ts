
import { Agent } from '@/data/agents';

export class AgentService {
  static async getAgents(): Promise<Agent[]> {
    // يمكن استبدالها بـ API call لاحقاً
    const { agents } = await import('@/data/agents');
    return agents;
  }

  static async getAgentById(id: number): Promise<Agent | undefined> {
    const agents = await this.getAgents();
    return agents.find(agent => agent.id === id);
  }

  static async updateAgentStatus(id: number, status: string): Promise<Agent | null> {
    // محاكاة تحديث الحالة
    const agents = await this.getAgents();
    const agent = agents.find(a => a.id === id);
    if (agent) {
      agent.status = status;
      return agent;
    }
    return null;
  }

  static async addAgent(newAgent: Omit<Agent, 'id'>): Promise<Agent> {
    const agents = await this.getAgents();
    const id = Math.max(...agents.map(a => a.id)) + 1;
    const agent: Agent = { ...newAgent, id };
    agents.push(agent);
    return agent;
  }

  static getAgentsByRole(role: string): Promise<Agent[]> {
    return this.getAgents().then(agents => 
      agents.filter(agent => agent.role === role)
    );
  }

  static getActiveAgents(): Promise<Agent[]> {
    return this.getAgents().then(agents => 
      agents.filter(agent => agent.status === 'نشط' || agent.status === 'نشطة')
    );
  }
}
