import { GoogleGenAI, Type } from "@google/genai";
import type { Customer, MarketingAction } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const customerObjectSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "The 'Customer' ID from the CSV." },
        state: { type: Type.STRING },
        response: { type: Type.STRING },
        coverage: { type: Type.STRING },
        education: { type: Type.STRING },
        employmentStatus: { type: Type.STRING },
        gender: { type: Type.STRING, enum: ["Male", "Female"] },
        income: { type: Type.NUMBER },
        locationCode: { type: Type.STRING },
        maritalStatus: { type: Type.STRING },
        monthlyPremiumAuto: { type: Type.NUMBER },
        monthsSinceLastClaim: { type: Type.INTEGER },
        monthsSincePolicyInception: { type: Type.INTEGER },
        numberOfOpenComplaints: { type: Type.INTEGER },
        numberOfPolicies: { type: Type.INTEGER },
        policyType: { type: Type.STRING },
        policy: { type: Type.STRING },
        renewOfferType: { type: Type.STRING },
        salesChannel: { type: Type.STRING },
        totalClaimAmount: { type: Type.NUMBER },
        vehicleClass: { type: Type.STRING },
        vehicleSize: { type: Type.STRING },
        segment: { type: Type.STRING, enum: ['Champion', 'Loyal', 'At Risk', 'Lost', 'Newcomer'] },
        clvData: {
            type: Type.OBJECT,
            properties: {
                clvEstimate: { type: Type.NUMBER },
                confidenceInterval: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                recency: { type: Type.INTEGER, description: "Use the value from 'Months Since Last Claim'." },
                frequency: { type: Type.INTEGER, description: "Use the value from 'Number of Policies'." },
                monetary: { type: Type.NUMBER, description: "Use the value from 'Monthly Premium Auto'." },
                purchaseProbability: { type: Type.NUMBER },
                expectedPurchases: { type: Type.NUMBER },
                shapValues: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            feature: { type: Type.STRING },
                            value: { type: Type.NUMBER },
                        },
                        required: ["feature", "value"],
                    },
                },
            },
            required: ["clvEstimate", "confidenceInterval", "recency", "frequency", "monetary", "purchaseProbability", "expectedPurchases", "shapValues"],
        },
    },
    required: ["id", "state", "coverage", "education", "employmentStatus", "gender", "income", "locationCode", "maritalStatus", "monthlyPremiumAuto", "monthsSinceLastClaim", "monthsSincePolicyInception", "numberOfOpenComplaints", "numberOfPolicies", "policyType", "policy", "renewOfferType", "salesChannel", "totalClaimAmount", "vehicleClass", "vehicleSize", "segment", "clvData"],
};

const processBatch = async (csvChunk: string): Promise<Customer[]> => {
    const prompt = `
        You are a data science expert specializing in the insurance industry. Your task is to process a raw CSV file of customer data and transform it into a structured JSON array of customer objects.

        For each customer in the provided CSV data, you must perform the following steps:
        1.  Create one JSON object per customer. The 'id' field must be the 'Customer' value from the CSV.
        2.  Map the columns directly to the corresponding fields in the JSON object.
        3.  Generate the 'clvData' object for each customer. This involves using specific columns as proxies for Recency, Frequency, and Monetary (RFM) values:
            -   **recency**: Use the exact value from the 'Months Since Last Claim' column.
            -   **frequency**: Use the exact value from the 'Number of Policies' column.
            -   **monetary**: Use the exact value from the 'Monthly Premium Auto' column.
        4.  Based on all available customer data (income, policy details, RFM proxies), estimate a plausible Customer Lifetime Value ('clvEstimate'). A customer with high income, multiple policies, and a high premium should have a high CLV.
        5.  Generate a realistic 95% confidence interval for the CLV estimate.
        6.  Estimate a 'purchaseProbability' (likelihood of renewal or buying another policy) and 'expectedPurchases' (number of future policies/renewals).
        7.  Assign a customer 'segment' ('Champion', 'Loyal', 'At Risk', 'Lost', 'Newcomer') that logically follows from the data. Customers with long policy inception, many policies, and low months since last claim are 'Champions'. Customers with very high months since last claim are 'At Risk' or 'Lost'.
        8.  Generate a list of SHAP values (CLV drivers) that are consistent with the customer's profile. Key drivers will likely be 'Income', 'Number of Policies', 'Monthly Premium Auto', and 'Months Since Policy Inception'.

        Here is the raw CSV data for this batch:
        \`\`\`csv
        ${csvChunk}
        \`\`\`

        Return ONLY the JSON array of customer objects, adhering strictly to the provided JSON schema. Do not include any other text or explanations.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: customerObjectSchema,
                },
            },
        });

        const text = response.text;
        const customers: Customer[] = JSON.parse(text);
        return customers;
    } catch (error) {
        console.error("Error processing a batch:", error);
        throw new Error("A batch failed to process with Gemini API.");
    }
}

export const processCustomerDataFile = async (csvContent: string): Promise<Customer[]> => {
    const lines = csvContent.trim().split('\n');
    if (lines.length <= 1) {
        return [];
    }

    const header = lines[0];
    const rows = lines.slice(1);
    const batchSize = 100; // Process 100 customers at a time
    const batches: string[] = [];

    for (let i = 0; i < rows.length; i += batchSize) {
        const chunk = rows.slice(i, i + batchSize);
        const batchCsv = [header, ...chunk].join('\n');
        batches.push(batchCsv);
    }
    
    console.log(`Processing ${rows.length} customers in ${batches.length} batches.`);

    try {
        const processingPromises = batches.map(batch => processBatch(batch));
        const results = await Promise.all(processingPromises);
        const allCustomers = results.flat();
        console.log(`Successfully processed ${allCustomers.length} customers.`);
        return allCustomers;
    } catch (error) {
        console.error("Error processing customer data file in batches:", error);
        throw new Error("Failed to process data with Gemini API. One or more batches failed.");
    }
};


export const getMarketingRecommendations = async (customer: Customer): Promise<MarketingAction[]> => {
  const prompt = `
    You are an expert marketing strategist for an insurance company. Your goal is to increase customer lifetime value and retention.

    Analyze the following insurance customer profile:
    - Customer ID: ${customer.id}
    - State: ${customer.state}
    - Segment: ${customer.segment}
    - Predicted CLV: $${customer.clvData.clvEstimate.toFixed(2)}
    - Employment Status: ${customer.employmentStatus}
    - Income: $${customer.income}
    - Policies: ${customer.numberOfPolicies} (${customer.policyType})
    - Coverage Level: ${customer.coverage}
    - Monthly Premium: $${customer.monthlyPremiumAuto}
    - Months Since Last Claim: ${customer.monthsSinceLastClaim}
    - Months Since Policy Inception: ${customer.monthsSincePolicyInception}
    - Key CLV Drivers (SHAP values):
      ${customer.clvData.shapValues.map(s => `  - ${s.feature}: ${s.value > 0 ? 'Positive impact' : 'Negative impact'}`).join('\n')}

    Based on this data, provide three distinct, actionable marketing recommendations to improve this specific customer's retention and increase their lifetime value.

    For each recommendation, provide:
    1. A short, compelling title.
    2. A clear description of the action to be taken.
    3. A concise rationale explaining why this action is suitable for this specific customer.

    Return the output as a valid JSON array of objects, where each object has "title", "description", and "rationale" keys. Do not include any text outside of the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              rationale: { type: Type.STRING },
            },
            required: ["title", "description", "rationale"],
          },
        },
      },
    });
    
    const text = response.text;
    const recommendations: MarketingAction[] = JSON.parse(text);
    return recommendations;

  } catch (error) {
    console.error("Error fetching marketing recommendations:", error);
    throw new Error("Failed to get recommendations from Gemini API.");
  }
};

export const processSingleCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
    const prompt = `
        You are a data science expert specializing in the insurance industry. Your task is to process partial data for a single new customer and transform it into a structured JSON object.

        Here is the known information about the customer:
        - Customer ID: ${customerData.id}
        - State: ${customerData.state}
        - Coverage: ${customerData.coverage}
        - Education: ${customerData.education}
        - Income: ${customerData.income}
        - Monthly Premium Auto: ${customerData.monthlyPremiumAuto}
        - Months Since Last Claim: ${customerData.monthsSinceLastClaim}
        - Number of Policies: ${customerData.numberOfPolicies}

        Based on this partial information, you must perform the following steps to complete their profile:
        1.  Complete the full JSON object for this customer. You can generate sensible defaults for missing fields like 'employmentStatus', 'gender', 'maritalStatus', etc.
        2.  Generate the 'clvData' object. Use the provided values for Recency, Frequency, and Monetary proxies:
            -   **recency**: Use the value from 'Months Since Last Claim'.
            -   **frequency**: Use the value from 'Number of Policies'.
            -   **monetary**: Use the value from 'Monthly Premium Auto'.
        3.  Based on all available data, estimate a plausible Customer Lifetime Value ('clvEstimate'). A customer with high income, multiple policies, and a high premium should have a high CLV.
        4.  Generate a realistic 95% confidence interval for the CLV estimate.
        5.  Estimate a 'purchaseProbability' and 'expectedPurchases'.
        6.  Assign a customer 'segment' ('Champion', 'Loyal', 'At Risk', 'Lost', 'Newcomer') that logically follows from the data.
        7.  Generate a list of SHAP values (CLV drivers) that are consistent with the customer's profile.

        Return ONLY the single, complete JSON object for this customer, adhering strictly to the provided JSON schema. Do not include any other text or explanations.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: customerObjectSchema,
            },
        });

        const text = response.text;
        const customer: Customer = JSON.parse(text);
        return customer;
    } catch (error) {
        console.error("Error processing single customer:", error);
        throw new Error("Failed to process new customer with Gemini API.");
    }
};
