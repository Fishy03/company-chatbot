from app.services.search import search_knowledge
from app.services.ollama import generate_response


FALLBACK_MESSAGE = (
    "I couldn't find that information in the company knowledge base."
)


def answer_question(
    question: str,
    history: list = None
) -> str:

    if history is None:
        history = []

    # --------------------------------------------------
    # BUILD CONVERSATION CONTEXT
    # --------------------------------------------------

    conversation = ""

    for message in history:

        role = message.get("role", "")
        content = message.get("content", "")

        if role == "user":
            conversation += f"User: {content}\n"

        elif role == "assistant":
            conversation += f"Assistant: {content}\n"


    # --------------------------------------------------
    # FIND PREVIOUS USER QUESTION
    # --------------------------------------------------

    previous_user_question = ""

    for message in reversed(history):

        if message.get("role") == "user":

            previous_user_question = message.get(
                "content",
                ""
            )

            break


    # --------------------------------------------------
    # CLASSIFY CURRENT QUESTION
    # --------------------------------------------------

    # For a short follow-up, the previous question gives us
    # important information about what the user is talking about.

    short_follow_up_words = [
        "what about",
        "and",
        "what about it",
        "what about that",
        "who uses it",
        "who handles it",
        "who handles that",
        "what does it",
        "what does that",
        "how about",
    ]

    normalized_question = question.strip().lower()

    is_short_follow_up = (
        len(normalized_question.split()) <= 6
        and any(
            normalized_question.startswith(word)
            for word in short_follow_up_words
        )
    )


    # --------------------------------------------------
    # USE PREVIOUS QUESTION FOR CLEAR FOLLOW-UPS
    # --------------------------------------------------

    if is_short_follow_up and previous_user_question:

        previous_classification_prompt = f"""
Determine whether this previous user question is about
COMPANY-specific information or GENERAL information.

Reply with ONLY one word:

COMPANY
or
GENERAL

Previous user question:
{previous_user_question}

Answer:
"""

        previous_classification = (
            generate_response(
                previous_classification_prompt
            )
            .strip()
            .upper()
        )

        if "COMPANY" in previous_classification:

            classification = "COMPANY"

        else:

            classification = "GENERAL"


    # --------------------------------------------------
    # NORMAL CLASSIFICATION
    # --------------------------------------------------

    else:

        classification_prompt = f"""
Determine whether the user's latest question is a GENERAL
question or a COMPANY-specific question.

Reply with ONLY one word:

COMPANY
or
GENERAL

Use COMPANY if the question asks about this company's:
- policies
- departments
- employees
- projects
- procedures
- internal systems
- internal documents
- company-specific facts

Use GENERAL for:
- general knowledge
- geography
- history
- programming
- mathematics
- science
- explanations
- casual conversation
- greetings

Examples:

"What is the capital of Belgium?"
GENERAL

"What is Project Phoenix?"
COMPANY

"Who handles employee leave?"
COMPANY

"What is an API?"
GENERAL

Conversation history:
----------------
{conversation}
----------------

Latest user question:
{question}

Answer:
"""

        classification = (
            generate_response(
                classification_prompt
            )
            .strip()
            .upper()
        )


    # --------------------------------------------------
    # GENERAL QUESTION
    # --------------------------------------------------

    if "GENERAL" in classification:

        general_prompt = f"""
You are a helpful general-purpose AI assistant.

Answer the user's latest question normally and clearly.

Use the previous conversation to understand references
such as "it", "that", "they", "this", or follow-up questions.

Do not turn a general question into a company question
unless the user clearly asks about the company.

Previous conversation:
----------------
{conversation}
----------------

Latest user question:
{question}

Answer:
"""

        return generate_response(
            general_prompt
        )


    # --------------------------------------------------
    # COMPANY QUESTION
    # --------------------------------------------------

    search_query = f"""
Previous conversation:
{conversation}

Current question:
{question}
"""


    results = search_knowledge(
        search_query,
        limit=3
    )


    if not results:

        return FALLBACK_MESSAGE


    # --------------------------------------------------
    # BUILD COMPANY CONTEXT
    # --------------------------------------------------

    context_parts = []

    for result in results:

        text = result.payload.get(
            "text",
            ""
        )

        document = result.payload.get(
            "document",
            "Unknown document"
        )

        context_parts.append(
            f"Source: {document}\n"
            f"Content: {text}"
        )


    context = "\n\n".join(
        context_parts
    )


    # --------------------------------------------------
    # COMPANY ANSWER
    # --------------------------------------------------

    company_prompt = f"""
You are an internal company knowledge assistant.

Answer the user's latest question using ONLY the
company information provided in the context below.

You may use the previous conversation only to understand
what the user means.

Do NOT use the previous conversation as a source of
company facts.

Do NOT use your general knowledge to invent company facts.

If the answer cannot be found in the company context,
say exactly:

"{FALLBACK_MESSAGE}"

Do not invent, assume, or guess company information.

Keep the answer concise and directly answer the question.

When answering a company question, mention the source
document used for the answer.

At the end of your answer, include:

Source: <document name>

If multiple documents were relevant, list each relevant
document.

Previous conversation:
----------------
{conversation}
----------------

Company context:
----------------
{context}
----------------

Latest user question:
{question}

Answer:
"""

    return generate_response(
        company_prompt
    )