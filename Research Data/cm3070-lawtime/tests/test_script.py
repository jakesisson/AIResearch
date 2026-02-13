"""
Test script for cm3070-lawtime repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for legal document processing and task extraction
TEST_INPUTS = [
    {
        "scenario": "court_hearing_document",
        "messages": [
            "Process this court hearing document: 威海市文登区人民法院开庭传票 案号(2025)鲁1003民初0001号 被传唤人：阿里巴巴公司 传唤事由：开庭 应到时间：2025年8月26日13:40",
            "What type of document is this?",
        ]
    },
    {
        "scenario": "contract_document",
        "messages": [
            "Process this contract: 聘请常年法律顾问协议书 甲方：阿里巴巴公司 乙方：朝阳律师事务所 协议有效期：2025年6月1日至2027年5月31日",
            "Extract the key contract details.",
        ]
    },
    {
        "scenario": "asset_preservation_document",
        "messages": [
            "Process this asset preservation notice: 保全告知书 查封深圳腾讯公司名下和平路1号不动产，查封起止日期2025年7月8日至2028年7月7日",
            "What are the preservation details?",
        ]
    },
    {
        "scenario": "voice_note_task_extraction",
        "messages": [
            "Process this voice note transcription: 提醒我明天上午跟进一下阿里巴巴那个案子，另外下午两点在星巴克跟张三开个会。",
            "Extract all tasks from this voice note.",
        ]
    },
    {
        "scenario": "party_resolution",
        "messages": [
            "Identify parties in this document: 关于阿里巴巴（中国）有限公司与深圳市腾讯计算机系统有限公司之间的合同纠纷案，需要联系对方律师李明。",
            "Which parties are mentioned and what are their relationships?",
        ]
    },
    {
        "scenario": "general_task_extraction",
        "messages": [
            "Extract tasks from: 王律师，关于阿里巴巴的案子有两件事需要处理：1.请审核一下附件里的这份证据清单，看看有没有问题。2.请在明天下午之前，联系一下对方律师李明，确认一下他是否收到了我们的函件。",
            "List all actionable tasks.",
        ]
    },
    {
        "scenario": "hearing_details_extraction",
        "messages": [
            "Extract hearing details from: 庭审笔录显示，原告代理人陈述了案件事实，被告代理人提出了抗辩意见。法官要求双方在3日内提交补充证据。",
            "What are the key hearing details?",
        ]
    },
    {
        "scenario": "contract_renewal_extraction",
        "messages": [
            "Extract contract renewal information: 法律顾问协议将于2025年12月31日到期，需要提前30天决定是否续签。",
            "What are the renewal requirements?",
        ]
    },
    {
        "scenario": "post_hearing_tasks",
        "messages": [
            "Extract post-hearing tasks: 庭审结束后，需要：1.整理庭审笔录 2.准备补充证据材料 3.联系客户汇报庭审情况",
            "What tasks need to be completed after the hearing?",
        ]
    },
    {
        "scenario": "multi_document_processing",
        "messages": [
            "Process multiple documents: First document is a court hearing notice, second is a contract, third is an asset preservation notice.",
            "Classify each document and extract relevant information.",
        ]
    },
    {
        "scenario": "complex_voice_note",
        "messages": [
            "Process complex voice note: 明天下午三点半，去朝阳区执行局那边，处理一下腾讯的财产保全解除申请。另外，记得下周五之前要提交管辖权异议申请。",
            "Extract all tasks with their deadlines.",
        ]
    },
    {
        "scenario": "document_classification_edge_case",
        "messages": [
            "Classify this ambiguous document: 关于近期法律咨询事项的备忘录，涉及合同纠纷和财产保全的相关建议。",
            "What type of document is this and why?",
        ]
    },
]
