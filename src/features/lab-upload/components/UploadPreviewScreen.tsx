import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Screen,
  Typography,
  UploadBottomSheet,
  UploadedFile,
  UploadError,
} from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { FileSizeMessage, FlowErrorScreen } from './FlowErrorScreen';

const UPLOAD_LOADING_DURATION_MS = 2400;

export function UploadPreviewScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { name, size, uri, mimeType, errorType } = useLocalSearchParams<{
    name?: string;
    size?: string;
    uri?: string;
    mimeType?: string;
    errorType?: string;
  }>();
  const [isUploading, setIsUploading] = useState(true);
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  const fileName = name || 'Blood_test_report.jpg';
  const fileSize = size || '0.8MB';
  const fileType = fileName.split('.').pop()?.toUpperCase() || 'JPG';
  const fileUri = typeof uri === 'string' ? uri : undefined;
  const fileMimeType = typeof mimeType === 'string' ? mimeType : undefined;
  const hasSelectedFile = Boolean(fileUri);
  const isImagePreview =
    hasSelectedFile &&
    (fileMimeType?.startsWith('image/') ||
      ['JPG', 'JPEG', 'PNG', 'HEIC', 'WEBP'].includes(fileType));
  const isPdfPreview = fileMimeType === 'application/pdf' || fileType === 'PDF';

  useEffect(() => {
    setIsUploading(true);
    const timeout = setTimeout(() => setIsUploading(false), UPLOAD_LOADING_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [fileName, fileSize, fileUri]);

  const handleUploadAnother = (file: UploadedFile) => {
    router.replace({
      pathname: '/(main)/preview-upload',
      params: {
        name: file.name,
        size: file.size,
        uri: file.uri,
        mimeType: file.mimeType,
      },
    });
  };

  const handleUploadError = (error: UploadError) => {
    router.replace({
      pathname: '/(main)/preview-upload',
      params: { errorType: error.type },
    });
  };

  const handleGetAiReview = () => {
    router.push({
      pathname: '/(main)/ai-review',
      params: {
        caseId: `mock-${Date.now()}`,
        name: fileName,
        size: fileSize,
        uri: fileUri,
        mimeType: fileMimeType,
      },
    });
  };

  const handleBack = () => {
    router.replace('/(auth)/register');
  };

  if (errorType === 'upload-failed' || errorType === 'file-size' || errorType === 'file-type') {
    return (
      <>
        <FlowErrorScreen
          title="There was a problem uploading your lab result"
          message={
            errorType === 'file-size' ? (
              <FileSizeMessage />
            ) : errorType === 'file-type' ? (
              'Please upload a PDF, JPG, JPEG, or PNG file.'
            ) : (
              'Please select a different file or try uploading the file again.'
            )
          }
          onClose={handleBack}
          onRetry={() => setShowUploadSheet(true)}
          showDisabledAiReview
        />
        <UploadBottomSheet
          visible={showUploadSheet}
          onClose={() => setShowUploadSheet(false)}
          onUpload={handleUploadAnother}
          onUploadError={handleUploadError}
        />
      </>
    );
  }

  return (
    <>
      <Screen scrollable padding edges={['top', 'bottom']}>
        <View style={[styles.root, { gap: spacing.xl }]}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              hitSlop={12}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </Pressable>
            <Typography variant="h2" color={colors.textSecondary} style={styles.headerTitle}>
              Preview Upload
            </Typography>
          </View>

          <View style={styles.previewCard}>
            <Typography variant="h2" style={styles.fileName}>
              {fileName}
            </Typography>
            <Typography variant="h2" color={colors.textSecondary} style={styles.fileMeta}>
              {fileType} {'\u2022'} {fileSize}
            </Typography>

            <View style={styles.reportFrame}>
              {isImagePreview && fileUri ? (
                <Image
                  source={{ uri: fileUri }}
                  resizeMode="contain"
                  style={styles.uploadedImage}
                />
              ) : hasSelectedFile ? (
                <DocumentPreviewCard
                  fileName={fileName}
                  fileSize={fileSize}
                  fileType={fileType}
                  isPdf={isPdfPreview}
                />
              ) : (
                <ReportPreview />
              )}
              {isUploading ? (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#FFFFFF" size="large" />
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              label="Get AI Review"
              disabled={isUploading}
              onPress={handleGetAiReview}
              style={[
                styles.actionButton,
                { backgroundColor: isUploading ? '#F5F5F5' : colors.primary },
              ]}
              textColor={isUploading ? '#767676' : '#FFFFFF'}
            />

            {!isUploading ? (
              <Button
                label="Upload Another"
                variant="outline"
                onPress={() => setShowUploadSheet(true)}
                style={[styles.actionButton, styles.outlineButton]}
                textColor={colors.textSecondary}
                leftIcon={
                  <Ionicons name="cloud-upload-outline" size={22} color={colors.textSecondary} />
                }
              />
            ) : null}
          </View>
        </View>
      </Screen>

      <UploadBottomSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUpload={handleUploadAnother}
        onUploadError={handleUploadError}
      />
    </>
  );
}

function DocumentPreviewCard({
  fileName,
  fileSize,
  fileType,
  isPdf,
}: {
  fileName: string;
  fileSize: string;
  fileType: string;
  isPdf: boolean;
}) {
  return (
    <View style={styles.documentPreview}>
      <View style={styles.documentIconShell}>
        <Ionicons
          name={isPdf ? 'document-text-outline' : 'document-outline'}
          size={54}
          color="#1565C0"
        />
      </View>
      <Typography style={styles.documentType}>
        {isPdf ? 'PDF selected' : 'File selected'}
      </Typography>
      <Typography style={styles.documentName} numberOfLines={2}>
        {fileName}
      </Typography>
      <Typography style={styles.documentMeta}>
        {fileType} {'\u2022'} {fileSize}
      </Typography>
    </View>
  );
}

function ReportPreview() {
  return (
    <View style={styles.reportPaper}>
      <Typography variant="h3" color="#0F2A4A" align="center" style={styles.reportLogo}>
        GLOBAL PATHOLOGY LABS
      </Typography>
      <Typography variant="label" color="#0F2A4A" align="center" style={styles.reportSubtitle}>
        Comprehensive Metabolic Panel & Complete Blood Count
      </Typography>

      <View style={styles.reportMeta}>
        <Typography variant="label" color="#0F2A4A">
          Patient ID: JANE DOE
        </Typography>
        <Typography variant="label" color="#0F2A4A">
          DOB: 01/01-1980
        </Typography>
        <Typography variant="label" color="#0F2A4A">
          Collection Date: 2023-10-26
        </Typography>
        <Typography variant="label" color="#0F2A4A">
          Report Date: 2023-10-27
        </Typography>
      </View>

      <View style={styles.reportColumns}>
        <ReportColumn
          title="Comprehensive Metabolic Panel"
          rows={[
            'Glucose 95 mg/DL',
            'BUN 18 mg/DL',
            'Creatinine 0.9 mg/DL',
            'Sodium 141',
            'Calcium 9.5 mg/DL',
          ]}
        />
        <ReportColumn
          title="Complete Blood Count (CBC)"
          rows={['WBC 7.7', 'RBC 4.8', 'Hemoglobin 14', 'Platelets 250']}
        />
      </View>

      <View style={styles.reportNotes}>
        <Typography variant="label" color="#0F2A4A" style={styles.reportColumnTitle}>
          {"Interpreter's Notes:"}
        </Typography>
        <Typography variant="label" color="#0F2A4A">
          All values within normal limits. No immediate concerns.
        </Typography>
      </View>

      <View style={styles.watermark}>
        <Typography variant="h1" color="rgba(17, 24, 39, 0.22)" style={styles.watermarkText}>
          SAMPLE DOCUMENT
        </Typography>
      </View>
    </View>
  );
}

function ReportColumn({ title, rows }: { title: string; rows: string[] }) {
  return (
    <View style={styles.reportColumn}>
      <Typography variant="label" color="#0F2A4A" style={styles.reportColumnTitle}>
        {title}
      </Typography>
      {rows.map((row) => (
        <View key={row} style={styles.reportRow}>
          <Typography variant="label" color="#0F2A4A" style={styles.reportRowText}>
            {row}
          </Typography>
          <Ionicons name="checkmark" size={12} color="#16A34A" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 4,
    paddingBottom: 32,
  },
  header: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  backButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  headerTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  previewCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    gap: 14,
    height: 429,
    padding: 8,
    width: '100%',
  },
  fileName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
  },
  fileMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
  },
  reportFrame: {
    aspectRatio: 0.98,
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    borderRadius: 22,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 34,
  },
  uploadedImage: {
    height: '100%',
    width: '100%',
  },
  documentPreview: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  documentIconShell: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    height: 96,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    width: 96,
  },
  documentType: {
    color: '#1565C0',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  documentName: {
    color: '#111827',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
  },
  documentMeta: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19.5,
    textAlign: 'center',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    justifyContent: 'center',
  },
  reportPaper: {
    aspectRatio: 0.72,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    transform: [{ rotate: '-1.5deg' }],
    width: '86%',
  },
  reportLogo: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  reportSubtitle: {
    fontSize: 9,
    lineHeight: 12,
  },
  reportMeta: {
    gap: 1,
    marginTop: 16,
  },
  reportColumns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  reportColumn: {
    flex: 1,
    gap: 5,
  },
  reportColumnTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  reportRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
  },
  reportRowText: {
    flex: 1,
  },
  reportNotes: {
    gap: 2,
    marginTop: 18,
  },
  watermark: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-33deg' }],
  },
  watermarkText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  actions: {
    gap: 16,
  },
  actionButton: {
    height: 45,
    borderRadius: 12,
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D0D0D0',
    borderWidth: 1,
  },
});
