import { Request, Response } from 'express';
import { deployAdvancedAgents, getOrganizationAgents } from './deploy-advanced-agents';

export async function deployAgentsAPI(req: Request, res: Response) {
  try {
    const { organizationId = 'global' } = req.body;
    
    // Check if agents already exist
    const existingAgents = await getOrganizationAgents(organizationId);
    if (existingAgents.length > 0) {
      return res.json({
        success: true,
        message: 'Agents already deployed',
        agents: existingAgents,
        count: existingAgents.length
      });
    }
    
    // Deploy new agents
    const result = await deployAdvancedAgents(organizationId);
    
    res.json({
      success: true,
      message: 'AI Agents deployed successfully',
      result
    });
  } catch (error: any) {
    console.error('Deploy agents error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getAgentsAPI(req: Request, res: Response) {
  try {
    const { organizationId = 'global' } = req.query;
    
    const agents = await getOrganizationAgents(organizationId as string);
    
    res.json({
      success: true,
      agents,
      count: agents.length
    });
  } catch (error: any) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}