import React from 'react';
import { Document, Page, Text, View, StyleSheet,  } from '@react-pdf/renderer';
import type { StoredPolicy } from '../types/storedPolicy';
import { buildCreatePolicySql } from '../utils/policyBuilder';


const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  collectionHeader: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  schemaHeader: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#444',
  },
  tableHeader: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#666',
  },
  policyContainer: {
    marginBottom: 15,
    marginLeft: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sqlCode: {
    fontFamily: 'Courier',
    fontSize: 10,
    backgroundColor: '#f5f5f5',
    padding: 8,
    marginBottom: 10,
    border: '1px solid #ddd',
  },
  attributesTable: {
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 20,
    alignItems: 'center',
  },
  tableHeaderRow: {
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold',
  },
  tableCellLabel: {
    width: '25%',
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    fontWeight: 'bold',
  },
  tableCellValue: {
    width: '75%',
    padding: 5,
    fontSize: 10,
  },
  documentation: {
    fontSize: 10,
    marginTop: 5,
    fontStyle: 'italic',
    color: '#333',
  },
  documentationLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  }
});

interface PolicyPdfDocumentProps {
  policies: StoredPolicy[];
}

interface GroupedPolicies {
  [collection: string]: {
    [schema: string]: {
      [table: string]: StoredPolicy[];
    };
  };
}

const PolicyPdfDocument: React.FC<PolicyPdfDocumentProps> = ({ policies }) => {
  // Group policies
  const groupedPolicies: GroupedPolicies = {};

  policies.forEach(policy => {
    const collection = policy.collection || 'Uncategorized';
    const schema = policy.schema || 'public';
    const table = policy.table || 'Unknown Table';

    if (!groupedPolicies[collection]) groupedPolicies[collection] = {};
    if (!groupedPolicies[collection][schema]) groupedPolicies[collection][schema] = {};
    if (!groupedPolicies[collection][schema][table]) groupedPolicies[collection][schema][table] = [];

    groupedPolicies[collection][schema][table].push(policy);
  });

  // Sort keys for consistent order
  const sortedCollections = Object.keys(groupedPolicies).sort();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>RLS Policies Documentation</Text>
        
        {sortedCollections.map(collection => (
          <View key={collection}>
            <Text style={styles.collectionHeader}>Collection: {collection}</Text>
            
            {Object.keys(groupedPolicies[collection]).sort().map(schema => (
              <View key={schema}>
                <Text style={styles.schemaHeader}>Schema: {schema}</Text>
                
                {Object.keys(groupedPolicies[collection][schema]).sort().map(table => (
                  <View key={table}>
                    <Text style={styles.tableHeader}>Table: {table}</Text>
                    
                    {groupedPolicies[collection][schema][table].map(policy => (
                      <View key={policy.id} style={styles.policyContainer} wrap={false}>
                        <Text style={styles.policyTitle}>Policy: {policy.name}</Text>
                        
                        {/* SQL Code */}
                        <Text style={styles.sqlCode}>
                          {buildCreatePolicySql(policy)}
                        </Text>

                        {/* Attributes Table */}
                        <View style={styles.attributesTable}>
                          <View style={[styles.tableRow, styles.tableHeaderRow]}>
                            <Text style={styles.tableCellLabel}>Attribute</Text>
                            <Text style={styles.tableCellValue}>Value</Text>
                          </View>
                          
                          <View style={styles.tableRow}>
                            <Text style={styles.tableCellLabel}>Command</Text>
                            <Text style={styles.tableCellValue}>{policy.for}</Text>
                          </View>
                          
                          <View style={styles.tableRow}>
                            <Text style={styles.tableCellLabel}>Roles</Text>
                            <Text style={styles.tableCellValue}>{policy.to || 'PUBLIC'}</Text>
                          </View>
                          
                          {policy.using && (
                            <View style={styles.tableRow}>
                              <Text style={styles.tableCellLabel}>USING</Text>
                              <Text style={styles.tableCellValue}>{policy.using}</Text>
                            </View>
                          )}
                          
                          {policy.withCheck && (
                            <View style={styles.tableRow}>
                              <Text style={styles.tableCellLabel}>WITH CHECK</Text>
                              <Text style={styles.tableCellValue}>{policy.withCheck}</Text>
                            </View>
                          )}
                        </View>

                        {/* Documentation */}
                        {policy.documentation && (
                          <View>
                            <Text style={styles.documentationLabel}>Documentation:</Text>
                            <Text style={styles.documentation}>{policy.documentation}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default PolicyPdfDocument;
