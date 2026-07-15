import agentLoop from "../../../api/app/db/seeds/content/code/agent_loop.json";
import commandCategories from "../../../api/app/db/seeds/content/code/command_categories.json";
import commands from "../../../api/app/db/seeds/content/code/commands.json";
import hidden from "../../../api/app/db/seeds/content/code/hidden.json";
import simulator from "../../../api/app/db/seeds/content/code/simulator.json";
import toolCategories from "../../../api/app/db/seeds/content/code/tool_categories.json";
import tools from "../../../api/app/db/seeds/content/code/tools.json";
import pipeline from "../../../api/app/db/seeds/content/chat/pipeline.json";
import jargonCategories from "../../../api/app/db/seeds/content/jargon/categories.json";
import jargonTerms from "../../../api/app/db/seeds/content/jargon/terms.json";
import allJobTags from "../../../api/app/db/seeds/content/job/all_tags.json";
import jobQuestions from "../../../api/app/db/seeds/content/job/questions.json";
import functionCall from "../../../api/app/db/seeds/content/lab/function_call.json";
import inference from "../../../api/app/db/seeds/content/lab/inference.json";
import rag from "../../../api/app/db/seeds/content/lab/rag.json";
import tokenizer from "../../../api/app/db/seeds/content/lab/tokenizer.json";
import training from "../../../api/app/db/seeds/content/lab/training.json";

const byOrder = <T extends { sort_order: number }>(items: readonly T[]) =>
  [...items].sort((a, b) => a.sort_order - b.sort_order);

export function getJargon() {
  const categories = byOrder(jargonCategories).map((category) => ({
    slug: category.slug,
    label: category.label,
    terms: byOrder(
      jargonTerms.filter((term) => term.category_slug === category.slug),
    ).map(({ category_slug: _category, sort_order: _order, ...term }) => term),
  }));
  return {
    module: "jargon",
    total: categories.reduce((sum, category) => sum + category.terms.length, 0),
    categories,
  };
}

function jobSummary(question: (typeof jobQuestions)[number]) {
  return {
    id: question.id,
    title: question.title,
    category: question.category_slug,
    tag: question.tag,
    difficulty: question.difficulty,
    company: question.company,
    tags: question.tags,
  };
}

export function listJobs(category?: string | null, difficulty?: string | null) {
  const counts = new Map<string, number>();
  for (const question of jobQuestions) {
    counts.set(question.category_slug, (counts.get(question.category_slug) ?? 0) + 1);
  }
  const items = byOrder(jobQuestions)
    .filter((question) => !category || question.category_slug === category)
    .filter((question) => !difficulty || question.difficulty === difficulty)
    .map(jobSummary);
  return {
    module: "job",
    total: jobQuestions.length,
    all_tags: allJobTags.map((tag) => ({
      ...tag,
      count: tag.key === "all" ? jobQuestions.length : counts.get(tag.key) ?? 0,
    })),
    items,
  };
}

export function getJob(jobId: string) {
  const question = jobQuestions.find((item) => item.id === jobId);
  if (!question) return null;
  return {
    ...jobSummary(question),
    answer: question.answer,
    code: question.code,
    codeLabel: question.codeLabel,
    codeLines: question.codeLines,
    keyPoints: question.keyPoints,
    related: question.related,
  };
}

export function getCode() {
  return {
    module: "code",
    tools: {
      categories: byOrder(toolCategories).map((category) => {
        const categoryTools = byOrder(
          tools.filter((tool) => tool.category_slug === category.slug),
        ).map(({ category_slug: _category, slug: _slug, sort_order: _order, ...tool }) => tool);
        return {
          slug: category.slug,
          label: category.label,
          count: categoryTools.length,
          tools: categoryTools,
        };
      }),
    },
    commands: {
      categories: byOrder(commandCategories).map((category) => {
        const categoryCommands = byOrder(
          commands.filter((command) => command.category_slug === category.slug),
        ).map(({ category_slug: _category, slug: _slug, sort_order: _order, ...command }) => command);
        return {
          slug: category.slug,
          label: category.label,
          count: categoryCommands.length,
          commands: categoryCommands,
        };
      }),
    },
    simulator: byOrder(simulator).map(({ slug: _slug, sort_order: _order, ...item }) => item),
    agentLoop: byOrder(agentLoop).map(({ slug: _slug, sort_order: _order, ...item }) => item),
    hidden: byOrder(hidden).map(({ slug: _slug, sort_order: _order, ...item }) => item),
  };
}

export function getLab() {
  return {
    module: "lab",
    training,
    functionCall: byOrder(functionCall).map(({ slug: _slug, sort_order: _order, ...item }) => item),
    tokenizer,
    inference: byOrder(inference).map(({ slug: _slug, sort_order: _order, ...item }) => item),
    rag: byOrder(rag).map(({ slug: _slug, sort_order: _order, ...item }) => item),
  };
}

export function getChatPipeline() {
  return {
    module: "chat",
    stages: byOrder(pipeline).map(({ slug: _slug, sort_order: _order, ...item }) => item),
  };
}
